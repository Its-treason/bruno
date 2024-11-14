const os = require('os');
const fs = require('fs');
const fsPromise = require('fs/promises');
const qs = require('qs');
const https = require('https');
const tls = require('tls');
const path = require('path');
const decomment = require('decomment');
const contentDispositionParser = require('content-disposition');
const mime = require('mime-types');
const { ipcMain, app } = require('electron');
const { VarsRuntime, runScript } = require('@usebruno/js');
const { isUndefined, isNull, each, get, compact, cloneDeep } = require('lodash');
const prepareCollectionRequest = require('./prepare-collection-request');
const { uuid } = require('../../utils/common');
const interpolateVars = require('./interpolate-vars');
const { interpolateString } = require('./interpolate-string');
const { preferencesUtil } = require('../../store/preferences');
const { getProcessEnvVars } = require('../../store/process-env');
const { getBrunoConfig } = require('../../store/bruno-config');
const { HttpProxyAgent } = require('http-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { makeAxiosInstance } = require('./axios-instance');
const { addAwsV4Interceptor, resolveAwsV4Credentials } = require('./awsv4auth-helper');
const { addDigestInterceptor } = require('./digestauth-helper');
const { shouldUseProxy, PatchedHttpsProxyAgent } = require('../../utils/proxy-util');
const { chooseFileToSave } = require('../../utils/filesystem');
const { getCookieStringForUrl } = require('../../utils/cookies');
const {
  resolveOAuth2AuthorizationCodeAccessToken,
  transformClientCredentialsRequest,
  transformPasswordCredentialsRequest
} = require('./oauth2-helper');
const Oauth2Store = require('../../store/oauth2');
const iconv = require('iconv-lite');
const { parse, LosslessNumber } = require('lossless-json');

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
