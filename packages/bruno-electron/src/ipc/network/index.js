const os = require('os');
const fs = require('fs');
const fsPromise = require('fs/promises');
const qs = require('qs');
const https = require('https');
const tls = require('tls');
const axios = require('axios');
const path = require('path');
const decomment = require('decomment');
const contentDispositionParser = require('content-disposition');
const mime = require('mime-types');
const { ipcMain, app } = require('electron');
const { VarsRuntime, AssertRuntime, runScript } = require('@usebruno/js');
const { isUndefined, isNull, each, get, compact, cloneDeep } = require('lodash');
const prepareRequest = require('./prepare-request');
const prepareCollectionRequest = require('./prepare-collection-request');
const prepareGqlIntrospectionRequest = require('./prepare-gql-introspection-request');
const { cancelTokens, saveCancelToken, deleteCancelToken } = require('../../utils/cancel-token');
const { uuid } = require('../../utils/common');
const interpolateVars = require('./interpolate-vars');
const { interpolateString } = require('./interpolate-string');
const { sortFolder, getAllRequestsInFolderRecursively } = require('./helper');
const { preferencesUtil, getPreferences } = require('../../store/preferences');
const { getProcessEnvVars } = require('../../store/process-env');
const { getBrunoConfig } = require('../../store/bruno-config');
const { HttpProxyAgent } = require('http-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { makeAxiosInstance } = require('./axios-instance');
const { addAwsV4Interceptor, resolveAwsV4Credentials } = require('./awsv4auth-helper');
const { addDigestInterceptor } = require('./digestauth-helper');
const { shouldUseProxy, PatchedHttpsProxyAgent } = require('../../utils/proxy-util');
const { chooseFileToSave, writeBinaryFile, writeFile } = require('../../utils/filesystem');
const { getCookieStringForUrl, addCookieToJar, getDomainsWithCookies, cookieJar } = require('../../utils/cookies');
const {
  resolveOAuth2AuthorizationCodeAccessToken,
  transformClientCredentialsRequest,
  transformPasswordCredentialsRequest
} = require('./oauth2-helper');
const Oauth2Store = require('../../store/oauth2');
const { request: newRequest } = require('@usebruno/core');
const iconv = require('iconv-lite');
const { parse, LosslessNumber } = require('lossless-json');

const safeStringifyJSON = (data) => {
  try {
    return JSON.stringify(data);
  } catch (e) {
    return data;
  }
};

const safeParseJSON = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
};

const getEnvVars = (environment = {}) => {
  const variables = environment.variables;
  if (!variables || !variables.length) {
    return {
      __name__: environment.name
    };
  }

  const envVars = {};
  each(variables, (variable) => {
    if (variable.enabled) {
      envVars[variable.name] = variable.value;
    }
  });

  return {
    ...envVars,
    __name__: environment.name
  };
};

const protocolRegex = /^([-+\w]{1,25})(:?\/\/|:)/;

const saveCookies = (url, headers) => {
  if (preferencesUtil.shouldStoreCookies()) {
    let setCookieHeaders = [];
    if (headers['set-cookie']) {
      setCookieHeaders = Array.isArray(headers['set-cookie']) ? headers['set-cookie'] : [headers['set-cookie']];
      for (let setCookieHeader of setCookieHeaders) {
        if (typeof setCookieHeader === 'string' && setCookieHeader.length) {
          addCookieToJar(setCookieHeader, url);
        }
      }
    }
  }
};

const configureRequest = async (collectionUid, request, envVars, runtimeVariables, processEnvVars, collectionPath) => {
  if (!protocolRegex.test(request.url)) {
    request.url = `http://${request.url}`;
  }

  /**
   * @see https://github.com/usebruno/bruno/issues/211 set keepAlive to true, this should fix socket hang up errors
   * @see https://github.com/nodejs/node/pull/43522 keepAlive was changed to true globally on Node v19+
   */
  const httpsAgentRequestFields = { keepAlive: true };
  if (!preferencesUtil.shouldVerifyTls()) {
    httpsAgentRequestFields['rejectUnauthorized'] = false;
  }

  if (preferencesUtil.shouldUseCustomCaCertificate()) {
    const caCertFilePath = preferencesUtil.getCustomCaCertificateFilePath();
    if (caCertFilePath) {
      let caCertBuffer = fs.readFileSync(caCertFilePath);
      if (preferencesUtil.shouldKeepDefaultCaCertificates()) {
        caCertBuffer += '\n' + tls.rootCertificates.join('\n'); // Augment default truststore with custom CA certificates
      }
      httpsAgentRequestFields['ca'] = caCertBuffer;
    }
  }

  const brunoConfig = getBrunoConfig(collectionUid);
  const interpolationOptions = {
    envVars,
    runtimeVariables,
    processEnvVars
  };

  // client certificate config
  const clientCertConfig = get(brunoConfig, 'clientCertificates.certs', []);

  for (let clientCert of clientCertConfig) {
    const domain = interpolateString(clientCert?.domain, interpolationOptions);
    const type = clientCert?.type || 'cert';
    if (domain) {
      const hostRegex = '^https:\\/\\/' + domain.replaceAll('.', '\\.').replaceAll('*', '.*');
      if (request.url.match(hostRegex)) {
        if (type === 'cert') {
          try {
            let certFilePath = interpolateString(clientCert?.certFilePath, interpolationOptions);
            certFilePath = path.isAbsolute(certFilePath) ? certFilePath : path.join(collectionPath, certFilePath);
            let keyFilePath = interpolateString(clientCert?.keyFilePath, interpolationOptions);
            keyFilePath = path.isAbsolute(keyFilePath) ? keyFilePath : path.join(collectionPath, keyFilePath);

            httpsAgentRequestFields['cert'] = fs.readFileSync(certFilePath);
            httpsAgentRequestFields['key'] = fs.readFileSync(keyFilePath);
          } catch (err) {
            console.error('Error reading cert/key file', err);
            throw new Error('Error reading cert/key file' + err);
          }
        } else if (type === 'pfx') {
          try {
            let pfxFilePath = interpolateString(clientCert?.pfxFilePath, interpolationOptions);
            pfxFilePath = path.isAbsolute(pfxFilePath) ? pfxFilePath : path.join(collectionPath, pfxFilePath);
            httpsAgentRequestFields['pfx'] = fs.readFileSync(pfxFilePath);
          } catch (err) {
            console.error('Error reading pfx file', err);
            throw new Error('Error reading pfx file' + err);
          }
        }
        httpsAgentRequestFields['passphrase'] = interpolateString(clientCert.passphrase, interpolationOptions);
        break;
      }
    }
  }

  // proxy configuration
  let proxyConfig = get(brunoConfig, 'proxy', {});
  let proxyMode = get(proxyConfig, 'enabled', 'global');
  if (proxyMode === 'global') {
    proxyConfig = preferencesUtil.getGlobalProxyConfig();
    proxyMode = get(proxyConfig, 'mode', false);
  }

  // proxyMode is true, if the collection-level proxy is enabled.
  // proxyMode is 'on', if the app-level proxy mode is turned on.
  if (proxyMode === true || proxyMode === 'on') {
    const shouldProxy = shouldUseProxy(request.url, get(proxyConfig, 'bypassProxy', ''));
    if (shouldProxy) {
      const proxyProtocol = interpolateString(get(proxyConfig, 'protocol'), interpolationOptions);
      const proxyHostname = interpolateString(get(proxyConfig, 'hostname'), interpolationOptions);
      const proxyPort = interpolateString(get(proxyConfig, 'port'), interpolationOptions);
      const proxyAuthEnabled = get(proxyConfig, 'auth.enabled', false);
      const socksEnabled = proxyProtocol.includes('socks');
      let uriPort = isUndefined(proxyPort) || isNull(proxyPort) ? '' : `:${proxyPort}`;
      let proxyUri;
      if (proxyAuthEnabled) {
        const proxyAuthUsername = interpolateString(get(proxyConfig, 'auth.username'), interpolationOptions);
        const proxyAuthPassword = interpolateString(get(proxyConfig, 'auth.password'), interpolationOptions);

        proxyUri = `${proxyProtocol}://${proxyAuthUsername}:${proxyAuthPassword}@${proxyHostname}${uriPort}`;
      } else {
        proxyUri = `${proxyProtocol}://${proxyHostname}${uriPort}`;
      }
      if (socksEnabled) {
        request.httpsAgent = new SocksProxyAgent(
          proxyUri,
          Object.keys(httpsAgentRequestFields).length > 0 ? { ...httpsAgentRequestFields } : undefined
        );
        request.httpAgent = new SocksProxyAgent(proxyUri);
      } else {
        request.httpsAgent = new PatchedHttpsProxyAgent(
          proxyUri,
          Object.keys(httpsAgentRequestFields).length > 0 ? { ...httpsAgentRequestFields } : undefined
        );
        request.httpAgent = new HttpProxyAgent(proxyUri);
      }
    } else {
      request.httpsAgent = new https.Agent({
        ...httpsAgentRequestFields
      });
    }
  } else if (proxyMode === 'system') {
    const { http_proxy, https_proxy, no_proxy } = preferencesUtil.getSystemProxyEnvVariables();
    const shouldUseSystemProxy = shouldUseProxy(request.url, no_proxy || '');
    if (shouldUseSystemProxy) {
      try {
        if (http_proxy?.length) {
          new URL(http_proxy);
          request.httpAgent = new HttpProxyAgent(http_proxy);
        }
      } catch (error) {
        throw new Error('Invalid system http_proxy');
      }
      try {
        if (https_proxy?.length) {
          new URL(https_proxy);
          request.httpsAgent = new PatchedHttpsProxyAgent(
            https_proxy,
            Object.keys(httpsAgentRequestFields).length > 0 ? { ...httpsAgentRequestFields } : undefined
          );
        }
      } catch (error) {
        throw new Error('Invalid system https_proxy');
      }
    } else {
      request.httpsAgent = new https.Agent({
        ...httpsAgentRequestFields
      });
    }
  } else if (Object.keys(httpsAgentRequestFields).length > 0) {
    request.httpsAgent = new https.Agent({
      ...httpsAgentRequestFields
    });
  }
  const axiosInstance = makeAxiosInstance();

  if (request.oauth2) {
    let requestCopy = cloneDeep(request);
    switch (request?.oauth2?.grantType) {
      case 'authorization_code':
        interpolateVars(requestCopy, envVars, runtimeVariables, processEnvVars);
        const { data: authorizationCodeData, url: authorizationCodeAccessTokenUrl } =
          await resolveOAuth2AuthorizationCodeAccessToken(requestCopy, collectionUid);
        request.method = 'POST';
        request.headers['content-type'] = 'application/x-www-form-urlencoded';
        request.data = authorizationCodeData;
        request.url = authorizationCodeAccessTokenUrl;
        break;
      case 'client_credentials':
        interpolateVars(requestCopy, envVars, runtimeVariables, processEnvVars);
        const { data: clientCredentialsData, url: clientCredentialsAccessTokenUrl } =
          await transformClientCredentialsRequest(requestCopy);
        request.method = 'POST';
        request.headers['content-type'] = 'application/x-www-form-urlencoded';
        request.data = clientCredentialsData;
        request.url = clientCredentialsAccessTokenUrl;
        break;
      case 'password':
        interpolateVars(requestCopy, envVars, runtimeVariables, processEnvVars);
        const { data: passwordData, url: passwordAccessTokenUrl } = await transformPasswordCredentialsRequest(
          requestCopy
        );
        request.method = 'POST';
        request.headers['content-type'] = 'application/x-www-form-urlencoded';
        request.data = passwordData;
        request.url = passwordAccessTokenUrl;
        break;
    }
  }

  if (request.awsv4config) {
    request.awsv4config = await resolveAwsV4Credentials(request);
    addAwsV4Interceptor(axiosInstance, request);
    delete request.awsv4config;
  }

  if (request.digestConfig) {
    addDigestInterceptor(axiosInstance, request);
  }

  request.timeout = preferencesUtil.getRequestTimeout();

  // add cookies to request
  if (preferencesUtil.shouldSendCookies()) {
    const cookieString = getCookieStringForUrl(request.url);
    if (cookieString && typeof cookieString === 'string' && cookieString.length) {
      request.headers['cookie'] = cookieString;
    }
  }

  // Add API key to the URL
  if (request.apiKeyAuthValueForQueryParams && request.apiKeyAuthValueForQueryParams.placement === 'queryparams') {
    const urlObj = new URL(request.url);

    // Interpolate key and value as they can be variables before adding to the URL.
    const key = interpolateString(request.apiKeyAuthValueForQueryParams.key, interpolationOptions);
    const value = interpolateString(request.apiKeyAuthValueForQueryParams.value, interpolationOptions);

    urlObj.searchParams.set(key, value);
    request.url = urlObj.toString();
  }

  // Remove pathParams, already in URL (Issue #2439)
  delete request.pathParams;

  // Remove apiKeyAuthValueForQueryParams, already interpolated and added to URL
  delete request.apiKeyAuthValueForQueryParams;

  return axiosInstance;
};

const parseDataFromResponse = (response) => {
  // Parse the charset from content type: https://stackoverflow.com/a/33192813
  const charsetMatch = /charset=([^()<>@,;:"/[\]?.=\s]*)/i.exec(response.headers['content-type'] || '');
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#using_exec_with_regexp_literals
  const charsetValue = charsetMatch?.[1];
  const dataBuffer = Buffer.from(response.data);
  // Overwrite the original data for backwards compatibility
  let data;
  if (iconv.encodingExists(charsetValue)) {
    data = iconv.decode(dataBuffer, charsetValue);
  } else {
    data = iconv.decode(dataBuffer, 'utf-8');
  }
  // Try to parse response to JSON, this can quietly fail
  try {
    // Filter out ZWNBSP character
    // https://gist.github.com/antic183/619f42b559b78028d1fe9e7ae8a1352d
    data = data.replace(/^\uFEFF/, '');
    if (!disableParsingResponseJson) {
      data = JSON.parse(data);
    }
  } catch {}

  return { data, dataBuffer };
};

const registerNetworkIpc = (mainWindow) => {
  const onConsoleLog = async (type, args) => {
    console[type](...args);

    try {
      await mainWindow.webContents.send('main:console-log', {
        type,
        args
      });
    } catch (e) {
      console.error(`Could not send the above console.log to the BrowserWindow: "${e}"`);
    }
  };

  const runPreRequest = async (
    request,
    requestUid,
    envVars,
    collectionPath,
    collectionRoot,
    collectionUid,
    runtimeVariables,
    processEnvVars,
    scriptingConfig
  ) => {
    // run pre-request script
    const requestScript = compact([get(collectionRoot, 'request.script.req'), get(request, 'script.req')]).join(os.EOL);
    const scriptResult = await runScript(
      decomment(requestScript),
      request,
      null,
      {
        envVariables: envVars,
        runtimeVariables,
        processEnvVars
      },
      false,
      collectionPath,
      scriptingConfig,
      onConsoleLog
    );

    mainWindow.webContents.send('main:script-environment-update', {
      envVariables: scriptResult.envVariables,
      runtimeVariables: scriptResult.runtimeVariables,
      requestUid,
      collectionUid
    });

    // interpolate variables inside request
    interpolateVars(request, envVars, runtimeVariables, processEnvVars);

    // if this is a graphql request, parse the variables, only after interpolation
    // https://github.com/usebruno/bruno/issues/884
    if (request.mode === 'graphql') {
      request.data.variables = JSON.parse(request.data.variables);
    }

    // stringify the request url encoded params
    if (request.headers['content-type'] === 'application/x-www-form-urlencoded') {
      request.data = qs.stringify(request.data);
    }

    return scriptResult;
  };

  const runPostResponse = async (
    request,
    response,
    requestUid,
    envVars,
    collectionPath,
    collectionRoot,
    collectionUid,
    runtimeVariables,
    processEnvVars,
    scriptingConfig
  ) => {
    // run post-response vars
    const postResponseVars = get(request, 'vars.res', []);
    if (postResponseVars?.length) {
      const varsRuntime = new VarsRuntime();
      const result = varsRuntime.runPostResponseVars(
        postResponseVars,
        request,
        response,
        envVars,
        runtimeVariables,
        collectionPath,
        processEnvVars
      );

      if (result) {
        mainWindow.webContents.send('main:script-environment-update', {
          envVariables: result.envVariables,
          runtimeVariables: result.runtimeVariables,
          requestUid,
          collectionUid
        });
      }

      if (result?.error) {
        mainWindow.webContents.send('main:display-error', result.error);
      }
    }

    // run post-response script
    const responseScript = compact(
      scriptingConfig.flow === 'sequential'
        ? [get(collectionRoot, 'request.script.res'), get(request, 'script.res')]
        : [get(request, 'script.res'), get(collectionRoot, 'request.script.res')]
    ).join(os.EOL);

    const scriptResult = await runScript(
      decomment(responseScript),
      request,
      response,
      {
        envVariables: envVars,
        runtimeVariables,
        processEnvVars
      },
      false,
      collectionPath,
      scriptingConfig,
      onConsoleLog
    );

    mainWindow.webContents.send('main:script-environment-update', {
      envVariables: scriptResult.envVariables,
      runtimeVariables: scriptResult.runtimeVariables,
      requestUid,
      collectionUid
    });
    return scriptResult;
  };

  async function executeNewFolder(folder, collection, environment, globalVariables, recursive, delay) {
    const folderUid = folder ? folder.uid : null;
    const dataDir = path.join(app.getPath('userData'), 'responseCache');
    const cancelToken = uuid();
    const abortController = new AbortController();
    saveCancelToken(cancelToken, abortController);

    // TODO: Refactor this, getAllRequestInForlderRecursive and sortFolder to use items instead of the folder obj
    if (!folder) {
      folder = collection;
    }

    mainWindow.webContents.send('main:run-folder-event', {
      type: 'testrun-started',
      isRecursive: recursive,
      collectionUid: collection.uid,
      folderUid,
      cancelTokenUid: cancelToken
    });

    const folderRequests = [];
    if (recursive) {
      folderRequests.push(...getAllRequestsInFolderRecursively(folder.items));
    } else {
      // Filter out folder from current folder
      each(folder.items, (item) => {
        if (item.request) {
          folderRequests.push(item);
        }
      });

      // sort requests by seq property
      folderRequests.sort((a, b) => {
        return a.seq - b.seq;
      });
    }

    let currentRequestIndex = 0;
    let nJumps = 0; // count the number of jumps to avoid infinite loops
    while (currentRequestIndex < folderRequests.length) {
      const item = folderRequests[currentRequestIndex];

      if (!isNaN(delay) && delay > 0) {
        // Send the queue event so ui shows its loading
        mainWindow.webContents.send('main:run-folder-event', {
          type: 'request-delayed',
          itemUid: item.uid,
          collectionUid: collection.uid,
          folderUid
        });

        await new Promise((resolve) => {
          abortController.signal.addEventListener('abort', resolve);
          setTimeout(() => resolve(), delay);
        });
      }

      if (abortController.signal.aborted) {
        deleteCancelToken(cancelToken);
        mainWindow.webContents.send('main:run-folder-event', {
          type: 'testrun-ended',
          collectionUid: collection.uid,
          folderUid,
          error: 'Request runner cancelled'
        });
        return;
      }

      const res = await newRequest(
        item,
        collection,
        globalVariables,
        getPreferences(),
        cookieJar,
        dataDir,
        cancelToken,
        abortController,
        BRUNO_VERSION,
        'runner',
        environment,
        {
          runFolderEvent: (payload) => {
            mainWindow.webContents.send('main:run-folder-event', {
              ...payload,
              folderUid
            });
          },
          updateScriptEnvironment: (payload) => {
            mainWindow.webContents.send('main:script-environment-update', payload);
          },
          cookieUpdated: (payload) => {
            mainWindow.webContents.send('main:cookies-update', payload);
          },
          consoleLog: (payload) => {
            console.log('=== start console.log from your script ===');
            console.log(payload.args);
            console.log('=== end console.log from your script ===');
            try {
              mainWindow.webContents.send('main:console-log', payload);
            } catch (e) {
              console.error(`The above console.log could not be sent to electron: ${e}`);
              mainWindow.webContents.send('main:console-log', {
                type: 'error',
                args: [`console.${payload.type} could not be sent to electron: ${e}`, safeStringifyJSON(payload)]
              });
            }
          }
        }
      );
      if (abortController.signal.aborted) {
        mainWindow.webContents.send('main:run-folder-event', {
          type: 'error',
          error: 'Aborted',
          responseReceived: {},
          collectionUid: collection.uid,
          itemUid: item.uid,
          folderUid
        });
        continue;
      }

      if (res.error) {
        mainWindow.webContents.send('main:run-folder-event', {
          type: 'error',
          error: String(res.error) || 'An unknown error occurred while running the request',
          responseReceived: {},
          collectionUid: collection.uid,
          itemUid: item.uid,
          folderUid
        });
      }

      if (typeof res.nextRequestName !== 'string') {
        currentRequestIndex++;
        continue;
      }
      nJumps++;
      if (nJumps > 100) {
        throw new Error('Too many jumps, possible infinite loop');
      }
      const nextRequestIdx = folderRequests.findIndex((request) => request.name === res.nextRequestName);
      if (nextRequestIdx >= 0) {
        currentRequestIndex = nextRequestIdx;
      } else {
        console.error("Could not find request with name '" + res.nextRequestName + "'");
        currentRequestIndex++;
      }
    }

    deleteCancelToken(cancelToken);

    mainWindow.webContents.send('main:run-folder-event', {
      type: 'testrun-ended',
      collectionUid: collection.uid,
      folderUid,
      error: null
    });
  }

  async function executeNewRequest(event, item, collection, environment, globalVariables) {
    const dataDir = path.join(app.getPath('userData'), 'responseCache');
    const cancelToken = uuid();
    const abortController = new AbortController();
    saveCancelToken(cancelToken, abortController);

    const res = await newRequest(
      item,
      collection,
      globalVariables,
      getPreferences(),
      cookieJar,
      dataDir,
      cancelToken,
      abortController,
      BRUNO_VERSION,
      'standalone',
      environment,
      {
        updateScriptEnvironment: (payload) => {
          mainWindow.webContents.send('main:script-environment-update', payload);
        },
        cookieUpdated: (payload) => {
          mainWindow.webContents.send('main:cookies-update', payload);
        },
        requestEvent: (payload) => {
          mainWindow.webContents.send('main:run-request-event', payload);
        },
        consoleLog: (payload) => {
          mainWindow.webContents.send('main:console-log', payload);
        }
      }
    );
    if (res.error) {
      console.error(res.error);
    }

    deleteCancelToken(cancelToken);

    if (abortController.signal.aborted) {
      throw new Error('Request aborted');
    }

    return {
      status: res.response?.statusCode,
      headers: res.response?.headers,
      size: res.response?.size ?? 0,
      duration: res.response?.responseTime ?? 0,
      isNew: true,
      timeline: res.timeline,
      debug: res.debug.getClean(),
      timings: res.timings.getClean(),
      error: res.error ? String(res.error) : undefined
    };
  }

  // handler for sending http request
  ipcMain.handle(
    'send-http-request',
    async (event, item, collection, environment, runtimeVariables, globalVariables, useNewRequest) => {
      if (useNewRequest) {
        return await executeNewRequest(event, item, collection, environment, globalVariables);
      }

      const collectionUid = collection.uid;
      const collectionPath = collection.pathname;
      const cancelTokenUid = uuid();
      const requestUid = uuid();

      mainWindow.webContents.send('main:run-request-event', {
        type: 'request-queued',
        requestUid,
        collectionUid,
        itemUid: item.uid,
        cancelTokenUid
      });

      const collectionRoot = get(collection, 'root', {});
      const request = prepareRequest(item, collection);
      const envVars = getEnvVars(environment);
      const processEnvVars = getProcessEnvVars(collectionUid);
      const brunoConfig = getBrunoConfig(collectionUid);
      const scriptingConfig = get(brunoConfig, 'scripts', {});

      try {
        const controller = new AbortController();
        request.signal = controller.signal;
        saveCancelToken(cancelTokenUid, controller);

        await runPreRequest(
          request,
          requestUid,
          envVars,
          collectionPath,
          collectionRoot,
          collectionUid,
          runtimeVariables,
          processEnvVars,
          scriptingConfig
        );

        mainWindow.webContents.send('main:run-request-event', {
          type: 'request-sent',
          requestSent: {
            url: request.url,
            method: request.method,
            headers: request.headers,
            data: safeParseJSON(safeStringifyJSON(request.data)),
            timestamp: Date.now()
          },
          collectionUid,
          itemUid: item.uid,
          requestUid,
          cancelTokenUid
        });

        const axiosInstance = await configureRequest(
          collectionUid,
          request,
          envVars,
          runtimeVariables,
          processEnvVars,
          collectionPath
        );

        let response, responseTime;
        try {
          /** @type {import('axios').AxiosResponse} */
          response = await axiosInstance(request);

          // Prevents the duration on leaking to the actual result
          responseTime = response.headers.get('request-duration');
          response.headers.delete('request-duration');
        } catch (error) {
          deleteCancelToken(cancelTokenUid);

          // if it's a cancel request, don't continue
          if (axios.isCancel(error)) {
            let error = new Error('Request cancelled');
            error.isCancel = true;
            return Promise.reject(error);
          }

          if (error?.response) {
            response = error.response;

            // Prevents the duration on leaking to the actual result
            responseTime = response.headers.get('request-duration');
            response.headers.delete('request-duration');
          } else {
            // if it's not a network error, don't continue
            return Promise.reject(error);
          }
        }

        // Continue with the rest of the request lifecycle - post response vars, script, assertions, tests

        const { data, dataBuffer } = parseDataFromResponse(response);
        response.data = data;

        const responsePath = path.join(app.getPath('userData'), 'responseCache', item.uid);
        await fsPromise.writeFile(responsePath, dataBuffer);

        response.responseTime = responseTime;

        // save cookies
        if (preferencesUtil.shouldStoreCookies()) {
          saveCookies(request.url, response.headers);
        }

        // send domain cookies to renderer
        const domainsWithCookies = await getDomainsWithCookies();

        mainWindow.webContents.send('main:cookies-update', safeParseJSON(safeStringifyJSON(domainsWithCookies)));

        await runPostResponse(
          request,
          response,
          requestUid,
          envVars,
          collectionPath,
          collectionRoot,
          collectionUid,
          runtimeVariables,
          processEnvVars,
          scriptingConfig
        );

        // run assertions
        const assertions = get(request, 'assertions');
        if (assertions) {
          const assertRuntime = new AssertRuntime();
          const results = assertRuntime.runAssertions(
            assertions,
            request,
            response,
            envVars,
            runtimeVariables,
            collectionPath
          );

          mainWindow.webContents.send('main:run-request-event', {
            type: 'assertion-results',
            results: results,
            itemUid: item.uid,
            requestUid,
            collectionUid
          });
        }

        // run tests
        const testScript = item.draft ? get(item.draft, 'request.tests') : get(item, 'request.tests');
        const testFile = compact(
          scriptingConfig.flow === 'sequential'
            ? [get(collectionRoot, 'request.tests'), testScript]
            : [testScript, get(collectionRoot, 'request.tests')]
        ).join(os.EOL);

        if (typeof testFile === 'string') {
          const testResults = await runScript(
            decomment(testFile),
            request,
            response,
            {
              envVariables: envVars,
              runtimeVariables,
              processEnvVars
            },
            true,
            collectionPath,
            scriptingConfig,
            onConsoleLog
          );

          mainWindow.webContents.send('main:run-request-event', {
            type: 'test-results',
            results: testResults.results,
            itemUid: item.uid,
            requestUid,
            collectionUid
          });

          mainWindow.webContents.send('main:script-environment-update', {
            envVariables: testResults.envVariables,
            runtimeVariables: testResults.runtimeVariables,
            requestUid,
            collectionUid
          });
        }

        return {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          size: Buffer.byteLength(dataBuffer),
          duration: responseTime ?? 0
        };
      } catch (error) {
        deleteCancelToken(cancelTokenUid);

        return Promise.reject(error);
      }
    }
  );

  ipcMain.handle('send-collection-oauth2-request', async (event, collection, environment, runtimeVariables) => {
    try {
      const collectionUid = collection.uid;
      const collectionPath = collection.pathname;
      const requestUid = uuid();

      const collectionRoot = get(collection, 'root', {});
      const _request = collectionRoot?.request;
      const request = prepareCollectionRequest(_request, collectionRoot, collectionPath);
      const envVars = getEnvVars(environment);
      const processEnvVars = getProcessEnvVars(collectionUid);
      const brunoConfig = getBrunoConfig(collectionUid);
      const scriptingConfig = get(brunoConfig, 'scripts', {});

      await runPreRequest(
        request,
        requestUid,
        envVars,
        collectionPath,
        collectionRoot,
        collectionUid,
        runtimeVariables,
        processEnvVars,
        scriptingConfig
      );

      interpolateVars(request, envVars, collection.runtimeVariables, processEnvVars);
      const axiosInstance = await configureRequest(
        collection.uid,
        request,
        envVars,
        collection.runtimeVariables,
        processEnvVars,
        collectionPath
      );

      try {
        response = await axiosInstance(request);
      } catch (error) {
        if (error?.response) {
          response = error.response;
        } else {
          return Promise.reject(error);
        }
      }

      const { data } = parseDataFromResponse(response);
      response.data = data;

      await runPostResponse(
        request,
        response,
        requestUid,
        envVars,
        collectionPath,
        collectionRoot,
        collectionUid,
        runtimeVariables,
        processEnvVars,
        scriptingConfig
      );

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      };
    } catch (error) {
      return Promise.reject(error);
    }
  });

  ipcMain.handle('clear-oauth2-cache', async (event, uid) => {
    return new Promise((resolve, reject) => {
      try {
        const oauth2Store = new Oauth2Store();
        oauth2Store.clearSessionIdOfCollection(uid);
        resolve();
      } catch (err) {
        reject(new Error('Could not clear oauth2 cache'));
      }
    });
  });

  ipcMain.handle('cancel-http-request', async (event, cancelTokenUid) => {
    return new Promise((resolve, reject) => {
      if (cancelTokenUid && cancelTokens[cancelTokenUid]) {
        cancelTokens[cancelTokenUid].abort();
        deleteCancelToken(cancelTokenUid);
        resolve();
      } else {
        reject(new Error('cancel token not found'));
      }
    });
  });

  ipcMain.handle('fetch-gql-schema', async (event, endpoint, environment, _request, collection) => {
    try {
      const envVars = getEnvVars(environment);
      const collectionRoot = get(collection, 'root', {});
      const request = prepareGqlIntrospectionRequest(endpoint, envVars, _request, collectionRoot);

      request.timeout = preferencesUtil.getRequestTimeout();

      if (!preferencesUtil.shouldVerifyTls()) {
        request.httpsAgent = new https.Agent({
          rejectUnauthorized: false
        });
      }

      const requestUid = uuid();
      const collectionPath = collection.pathname;
      const collectionUid = collection.uid;
      const runtimeVariables = collection.runtimeVariables;
      const processEnvVars = getProcessEnvVars(collectionUid);
      const brunoConfig = getBrunoConfig(collection.uid);
      const scriptingConfig = get(brunoConfig, 'scripts', {});

      await runPreRequest(
        request,
        requestUid,
        envVars,
        collectionPath,
        collectionRoot,
        collectionUid,
        runtimeVariables,
        processEnvVars,
        scriptingConfig
      );

      interpolateVars(request, envVars, collection.runtimeVariables, processEnvVars);
      const axiosInstance = await configureRequest(
        collection.uid,
        request,
        envVars,
        collection.runtimeVariables,
        processEnvVars,
        collectionPath
      );
      const response = await axiosInstance(request);

      await runPostResponse(
        request,
        response,
        requestUid,
        envVars,
        collectionPath,
        collectionRoot,
        collectionUid,
        runtimeVariables,
        processEnvVars,
        scriptingConfig
      );

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      };
    } catch (error) {
      if (error.response) {
        return {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data
        };
      }

      return Promise.reject(error);
    }
  });

  ipcMain.handle(
    'renderer:run-collection-folder',
    async (
      event,
      folder,
      collection,
      environment,
      runtimeVariables,
      globalVariables,
      recursive,
      delay,
      newRequestMethod
    ) => {
      if (newRequestMethod) {
        return await executeNewFolder(folder, collection, environment, globalVariables, recursive, delay);
      }

      const collectionUid = collection.uid;
      const collectionPath = collection.pathname;
      const folderUid = folder ? folder.uid : null;
      const cancelTokenUid = uuid();
      const brunoConfig = getBrunoConfig(collectionUid);
      const scriptingConfig = get(brunoConfig, 'scripts', {});
      const collectionRoot = get(collection, 'root', {});

      const abortController = new AbortController();
      saveCancelToken(cancelTokenUid, abortController);

      if (!folder) {
        folder = collection;
      }

      mainWindow.webContents.send('main:run-folder-event', {
        type: 'testrun-started',
        isRecursive: recursive,
        collectionUid,
        folderUid,
        cancelTokenUid
      });

      try {
        const envVars = getEnvVars(environment);
        let folderRequests = [];

        if (recursive) {
          folderRequests = getAllRequestsInFolderRecursively(folder.items);
        } else {
          each(folder.items, (item) => {
            if (item.request) {
              folderRequests.push(item);
            }
          });

          // sort requests by seq property
          folderRequests.sort((a, b) => {
            return a.seq - b.seq;
          });
        }

        let currentRequestIndex = 0;
        let nJumps = 0; // count the number of jumps to avoid infinite loops
        while (currentRequestIndex < folderRequests.length) {
          // user requested to cancel runner
          if (abortController.signal.aborted) {
            let error = new Error('Runner execution cancelled');
            error.isCancel = true;
            throw error;
          }

          const item = folderRequests[currentRequestIndex];
          let nextRequestName;
          const itemUid = item.uid;
          const eventData = {
            collectionUid,
            folderUid,
            itemUid
          };

          let timeStart;
          let timeEnd;

          mainWindow.webContents.send('main:run-folder-event', {
            type: 'request-queued',
            ...eventData
          });

          const request = prepareRequest(item, collection);
          const requestUid = uuid();
          const processEnvVars = getProcessEnvVars(collectionUid);

          try {
            const preRequestScriptResult = await runPreRequest(
              request,
              requestUid,
              envVars,
              collectionPath,
              collectionRoot,
              collectionUid,
              runtimeVariables,
              processEnvVars,
              scriptingConfig
            );

            if (preRequestScriptResult?.nextRequestName !== undefined) {
              nextRequestName = preRequestScriptResult.nextRequestName;
            }

            // todo:
            // i have no clue why electron can't send the request object
            // without safeParseJSON(safeStringifyJSON(request.data))
            mainWindow.webContents.send('main:run-folder-event', {
              type: 'request-sent',
              requestSent: {
                url: request.url,
                method: request.method,
                headers: request.headers,
                data: safeParseJSON(safeStringifyJSON(request.data))
              },
              ...eventData
            });

            request.signal = abortController.signal;
            const axiosInstance = await configureRequest(
              collectionUid,
              request,
              envVars,
              runtimeVariables,
              processEnvVars,
              collectionPath
            );

            timeStart = Date.now();
            let response, responseTime;
            try {
              if (delay && !Number.isNaN(delay) && delay > 0) {
                const delayPromise = new Promise((resolve) => setTimeout(resolve, delay));

                const cancellationPromise = new Promise((_, reject) => {
                  abortController.signal.addEventListener('abort', () => {
                    reject(new Error('Cancelled'));
                  });
                });

                await Promise.race([delayPromise, cancellationPromise]);
              }

              /** @type {import('axios').AxiosResponse} */
              response = await axiosInstance(request);
              timeEnd = Date.now();

              const { data, dataBuffer } = parseDataFromResponse(response);
              response.data = data;
              response.responseTime = response.headers.get('request-duration');

              try {
                await fsPromise.mkdir(path.join(app.getPath('userData'), 'responseCache'));
              } catch {}
              const responsePath = path.join(app.getPath('userData'), 'responseCache', item.uid);
              await fsPromise.writeFile(responsePath, dataBuffer);

              // save cookies
              if (preferencesUtil.shouldStoreCookies()) {
                saveCookies(request.url, response.headers);
              }

              // send domain cookies to renderer
              const domainsWithCookies = await getDomainsWithCookies();

              mainWindow.webContents.send('main:cookies-update', safeParseJSON(safeStringifyJSON(domainsWithCookies)));

              mainWindow.webContents.send('main:run-folder-event', {
                type: 'response-received',
                responseReceived: {
                  status: response.status,
                  statusText: response.statusText,
                  headers: response.headers,
                  duration: timeEnd - timeStart,
                  size: Buffer.byteLength(dataBuffer),
                  responseTime: response.headers.get('request-duration')
                },
                ...eventData
              });
            } catch (error) {
              if (error?.response && !axios.isCancel(error)) {
                const { data, dataBuffer } = parseDataFromResponse(error.response);
                error.response.data = data;

                const responsePath = path.join(app.getPath('userData'), 'responseCache', item.uid);
                await fsPromise.writeFile(responsePath, dataBuffer);

                timeEnd = Date.now();
                response = {
                  status: error.response.status,
                  statusText: error.response.statusText,
                  headers: error.response.headers,
                  duration: timeEnd - timeStart,
                  size: Buffer.byteLength(dataBuffer),
                  responseTime: error.response.headers.get('request-duration')
                };

                // if we get a response from the server, we consider it as a success
                mainWindow.webContents.send('main:run-folder-event', {
                  type: 'response-received',
                  error: error ? error.message : 'An error occurred while running the request',
                  responseReceived: response,
                  ...eventData
                });
              } else {
                // if it's not a network error, don't continue
                throw Promise.reject(error);
              }
            }

            const postRequestScriptResult = await runPostResponse(
              request,
              response,
              requestUid,
              envVars,
              collectionPath,
              collectionRoot,
              collectionUid,
              runtimeVariables,
              processEnvVars,
              scriptingConfig
            );

            if (postRequestScriptResult?.nextRequestName !== undefined) {
              nextRequestName = postRequestScriptResult.nextRequestName;
            }

            // run assertions
            const assertions = get(item, 'request.assertions');
            if (assertions) {
              const assertRuntime = new AssertRuntime();
              const results = assertRuntime.runAssertions(
                assertions,
                request,
                response,
                envVars,
                runtimeVariables,
                processEnvVars
              );

              mainWindow.webContents.send('main:run-folder-event', {
                type: 'assertion-results',
                assertionResults: results,
                itemUid: item.uid,
                collectionUid
              });
            }

            // run tests
            const testScript = item.draft ? get(item.draft, 'request.tests') : get(item, 'request.tests');
            const testFile = compact(
              scriptingConfig.flow === 'sequential'
                ? [get(collectionRoot, 'request.tests'), testScript]
                : [testScript, get(collectionRoot, 'request.tests')]
            ).join(os.EOL);
            const testResults = await runScript(
              decomment(testFile),
              request,
              response,
              {
                envVariables: envVars,
                runtimeVariables,
                processEnvVars
              },
              true,
              collectionPath,
              scriptingConfig,
              null
            );
            mainWindow.webContents.send('main:run-folder-event', {
              type: 'test-results',
              testResults: testResults.results,
              ...eventData
            });
            if (testResults?.nextRequestName !== undefined) {
              nextRequestName = postRequestScriptResult.nextRequestName;
            }

            mainWindow.webContents.send('main:script-environment-update', {
              envVariables: testResults.envVariables,
              runtimeVariables: testResults.runtimeVariables,
              collectionUid
            });
            re / NextRequestOnTestScript;
          } catch (error) {
            mainWindow.webContents.send('main:run-folder-event', {
              type: 'error',
              error: error ? error.message : 'An error occurred while running the request',
              responseReceived: {},
              ...eventData
            });
          }
          if (nextRequestName !== undefined) {
            nJumps++;
            if (nJumps > 10000) {
              throw new Error('Too many jumps, possible infinite loop');
            }
            if (nextRequestName === null) {
              break;
            }
            const nextRequestIdx = folderRequests.findIndex((request) => request.name === nextRequestName);
            if (nextRequestIdx >= 0) {
              currentRequestIndex = nextRequestIdx;
            } else {
              console.error("Could not find request with name '" + nextRequestName + "'");
              currentRequestIndex++;
            }
          } else {
            currentRequestIndex++;
          }
        }

        deleteCancelToken(cancelTokenUid);
        mainWindow.webContents.send('main:run-folder-event', {
          type: 'testrun-ended',
          collectionUid,
          folderUid
        });
      } catch (error) {
        deleteCancelToken(cancelTokenUid);
        mainWindow.webContents.send('main:run-folder-event', {
          type: 'testrun-ended',
          collectionUid,
          folderUid,
          error: error && !error.isCancel ? error : null
        });
      }
    }
  );

  // Ensure the response dir directory exists
  const responseCacheDir = path.join(app.getPath('userData'), 'responseCache');
  try {
    fs.mkdirSync(responseCacheDir);
  } catch {}
  // Delete old files
  fs.readdir(responseCacheDir, (err, files) => {
    if (err) {
      throw err;
    }

    for (const file of files) {
      fs.rmSync(path.join(responseCacheDir, file));
    }
  });

  ipcMain.handle('renderer:get-response-body', async (_event, requestId) => {
    const responsePath = path.join(app.getPath('userData'), 'responseCache', requestId);

    let rawData;
    try {
      rawData = await fsPromise.readFile(responsePath);
    } catch (e) {
      return null;
    }

    let data = null;
    try {
      data = parse(rawData.toString('utf-8'), null, (value) => {
        // By default, this will return the LosslessNumber object, but because it's passed into ipc we
        // need to convert it into a number because LosslessNumber is converted into a weird object
        return new LosslessNumber(value).valueOf();
      });
    } catch (e) {
      data = rawData.toString('utf-8');
    }

    return { data, dataBuffer: rawData.toString('base64') };
  });

  // save response to file
  ipcMain.handle('renderer:save-response-to-file', async (event, itemUid, response, url) => {
    try {
      const getHeaderValue = (headerName) => {
        const headersArray = typeof response.headers === 'object' ? Object.entries(response.headers) : [];

        if (headersArray.length > 0) {
          const header = headersArray.find((header) => header[0] === headerName);
          if (header && header.length > 1) {
            return header[1];
          }
        }
      };

      const getFileNameFromContentDispositionHeader = () => {
        const contentDisposition = getHeaderValue('content-disposition');
        try {
          const disposition = contentDispositionParser.parse(contentDisposition);
          return disposition && disposition.parameters['filename'];
        } catch (error) {}
      };

      const getFileNameFromUrlPath = () => {
        const lastPathLevel = new URL(url).pathname.split('/').pop();
        if (lastPathLevel && /\..+/.exec(lastPathLevel)) {
          return lastPathLevel;
        }
      };

      const getFileNameBasedOnContentTypeHeader = () => {
        const contentType = getHeaderValue('content-type');
        const extension = (contentType && mime.extension(contentType)) || 'txt';
        return `response.${extension}`;
      };

      const determineFileName = () => {
        return (
          getFileNameFromContentDispositionHeader() || getFileNameFromUrlPath() || getFileNameBasedOnContentTypeHeader()
        );
      };

      const fileName = determineFileName();
      const targetFilePath = await chooseFileToSave(mainWindow, fileName);
      if (targetFilePath) {
        const responsePath = path.join(app.getPath('userData'), 'responseCache', itemUid);

        await fsPromise.copyFile(responsePath, targetFilePath);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  });
};

module.exports = registerNetworkIpc;
module.exports.configureRequest = configureRequest;
