const FormData = require('form-data');
const { each, forOwn, cloneDeep, extend } = require('lodash');
const { interpolate } = require('@usebruno/common');

const getContentType = (headers = {}) => {
  let contentType = '';
  forOwn(headers, (value, key) => {
    if (key && key.toLowerCase() === 'content-type') {
      contentType = value;
    }
  });

  return contentType;
};

const interpolateVars = (request, envVars = {}, runtimeVariables = {}, processEnvVars = {}) => {
  // we clone envVars because we don't want to modify the original object
  envVars = cloneDeep(envVars);

  // envVars can inturn have values as {{process.env.VAR_NAME}}
  // so we need to interpolate envVars first with processEnvVars
  forOwn(envVars, (value, key) => {
    envVars[key] = interpolate(value, {
      process: {
        env: {
          ...processEnvVars
        }
      }
    });
  });

  const _interpolate = (str) => {
    if (!str || !str.length || typeof str !== 'string') {
      return str;
    }

    // runtimeVariables take precedence over envVars
    const combinedVars = {
      ...envVars,
      ...runtimeVariables,
      process: {
        env: {
          ...processEnvVars
        }
      }
    };

    return interpolate(str, combinedVars);
  };

  request.url = _interpolate(request.url);

  forOwn(request.headers, (value, key) => {
    delete request.headers[key];
    request.headers[_interpolate(key)] = _interpolate(value);
  });

  const contentType = getContentType(request.headers);

  if (contentType.includes('json')) {
    if (typeof request.data === 'object') {
      try {
        let parsed = JSON.stringify(request.data);
        // Write the interpolated body into data, so one can see his values even if parsing fails
        request.data = _interpolate(parsed);
        request.data = JSON.parse(request.data);
      } catch (err) {}
    }

    if (typeof request.data === 'string') {
      if (request?.data?.length) {
        request.data = _interpolate(request.data);
      }
    }
  } else if (contentType === 'application/x-www-form-urlencoded') {
    if (typeof request.data === 'object') {
      try {
        let parsed = JSON.stringify(request.data);
        parsed = _interpolate(parsed);
        request.data = JSON.parse(parsed);
      } catch (err) {}
    }
  } else if (contentType === 'multipart/form-data') {
    // make axios work in node using form data
    // reference: https://github.com/axios/axios/issues/1006#issuecomment-320165427
    const form = new FormData();
    forOwn(request.data, (value, name) => {
      form.append(interpolate(name), interpolate(value));
    });

    extend(request.headers, form.getHeaders());
    request.data = form;
  } else {
    request.data = _interpolate(request.data);
  }

  each(request?.pathParams, (param) => {
    param.value = _interpolate(param.value);
  });

  if (request?.pathParams?.length) {
    let url = request.url;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `http://${url}`;
    }

    try {
      url = new URL(url);
    } catch (e) {
      throw { message: 'Invalid URL format', originalError: e.message };
    }

    const interpolatedUrlPath = url.pathname
      .split('/')
      .filter((path) => path !== '')
      .map((path) => {
        if (path[0] !== ':') {
          return '/' + path;
        } else {
          const name = path.slice(1);
          const existingPathParam = request?.pathParams?.find((param) => param.type === 'path' && param.name === name);
          return existingPathParam ? '/' + existingPathParam.value : '';
        }
      })
      .join('');

    request.url = url.origin + interpolatedUrlPath + url.search;
  }

  if (request.proxy) {
    request.proxy.protocol = _interpolate(request.proxy.protocol);
    request.proxy.hostname = _interpolate(request.proxy.hostname);
    request.proxy.port = _interpolate(request.proxy.port);

    if (request.proxy.auth) {
      request.proxy.auth.username = _interpolate(request.proxy.auth.username);
      request.proxy.auth.password = _interpolate(request.proxy.auth.password);
    }
  }

  // todo: we have things happening in two places w.r.t basic auth
  //       need to refactor this in the future
  // the request.auth (basic auth) object gets set inside the prepare-request.js file
  if (request.auth) {
    const username = _interpolate(request.auth.username) || '';
    const password = _interpolate(request.auth.password) || '';

    // use auth header based approach and delete the request.auth object
    request.headers['Authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    delete request.auth;
  }

  if (request.awsv4config) {
    request.awsv4config.accessKeyId = _interpolate(request.awsv4config.accessKeyId) || '';
    request.awsv4config.secretAccessKey = _interpolate(request.awsv4config.secretAccessKey) || '';
    request.awsv4config.sessionToken = _interpolate(request.awsv4config.sessionToken) || '';
    request.awsv4config.service = _interpolate(request.awsv4config.service) || '';
    request.awsv4config.region = _interpolate(request.awsv4config.region) || '';
    request.awsv4config.profileName = _interpolate(request.awsv4config.profileName) || '';
  }

  // interpolate vars for ntlmConfig auth
  if (request.ntlmConfig) {
    request.ntlmConfig.username = _interpolate(request.ntlmConfig.username) || '';
    request.ntlmConfig.password = _interpolate(request.ntlmConfig.password) || '';
    request.ntlmConfig.domain = _interpolate(request.ntlmConfig.domain) || '';
  }

  if (request) return request;
};

module.exports = interpolateVars;
