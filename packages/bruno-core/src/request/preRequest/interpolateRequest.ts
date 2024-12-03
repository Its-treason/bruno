import { RequestContext } from '../types';
import { interpolate } from '@usebruno/common';
import { LosslessNumber, parse, stringify } from 'lossless-json';
import decomment from 'decomment';

// This is wrapper/shorthand for the original `interpolate` function.
// The `name` parameter is used for debugLogging
type InterpolationShorthandFunction = (target: string, name: string) => string;

function interpolateBrunoConfigOptions(context: RequestContext, i: InterpolationShorthandFunction) {
  const brunoConfig = context.collection.brunoConfig;

  if (brunoConfig.clientCertificates?.certs) {
    for (const cert of brunoConfig.clientCertificates?.certs) {
      cert.certFilePath = i(cert.certFilePath, 'Certificate CertFilePath');
      cert.keyFilePath = i(cert.keyFilePath, 'Certificate KeyFilePath');
      cert.domain = i(cert.domain, 'Certificate domain');
      cert.passphrase = i(cert.passphrase, 'Certificate passphrase');
    }
  }

  if (brunoConfig.proxy) {
    // @ts-expect-error User need to make sure this is correct. `createHttpRequest` will throw an erro when this is not correct
    brunoConfig.proxy.protocol = i(brunoConfig.proxy.protocol, 'Proxy protocol');
    brunoConfig.proxy.hostname = i(brunoConfig.proxy.hostname, 'Proxy hostname');
    brunoConfig.proxy.port = Number(i(String(brunoConfig.proxy.port), 'Proxy port'));
    if (brunoConfig.proxy.auth?.enabled) {
      brunoConfig.proxy.auth.username = i(brunoConfig.proxy.auth.username, 'Proxy username');
      brunoConfig.proxy.auth.password = (brunoConfig.proxy.auth.password, 'Proxy password');
    }
  }
}

function interpolateRequestItem(context: RequestContext, i: InterpolationShorthandFunction) {
  const request = context.requestItem.request;

  let pos = 0;
  for (const header of request.headers) {
    pos++;
    header.name = i(header.name, `Header name #${pos}`);
    header.value = i(header.value, `Header value #${pos}`);
  }

  request.url = i(request.url, 'Request url');
  let urlParsed;
  try {
    urlParsed = new URL(context.requestItem.request.url);
  } catch (error) {
    if (context.requestItem.request.url.trim().length === 0) {
      // Ignore empty urls. This is probably a OAuth2 request.
      return;
    }
    throw new Error(`Could not parse your URL "${context.requestItem.request.url}": "${error}"`);
  }
  const urlPathname = urlParsed.pathname
    .split('/')
    .map((path) => {
      // Doesn't start with a ":" so its not a path parameter
      if (path[0] !== ':') {
        return path;
      }
      // Remove ":"
      const name = path.slice(1);
      const existingPathParam = request.params.find((param) => param.type === 'path' && param.name === name);
      return existingPathParam ? i(existingPathParam.value, `Path param "${existingPathParam.name}"`) : '';
    })
    .join('/');
  urlParsed.pathname = urlPathname;
  request.url = urlParsed.href;
}

function interpolateAuth(context: RequestContext, i: InterpolationShorthandFunction) {
  const auth = context.requestItem.request.auth;

  switch (auth.mode) {
    case 'none':
    case 'inherit':
      break;
    case 'basic':
      auth.basic.username = i(auth.basic.username, 'Basic auth username');
      auth.basic.password = i(auth.basic.password, 'Basic auth password');
      break;
    case 'bearer':
      auth.bearer.token = i(auth.bearer.token, 'Bearer token');
      break;
    case 'digest':
      auth.digest.username = i(auth.digest.username, 'Digest auth usernaem');
      auth.digest.password = i(auth.digest.password, 'Digest auth password');
      break;
    case 'apikey':
      auth.apikey.key = i(auth.apikey.key, 'ApiKey auth key');
      auth.apikey.value = i(auth.apikey.value, 'ApiKey auth value');
      break;
    case 'wsse':
      auth.wsse.username = i(auth.wsse.username, 'WSSE auth username');
      auth.wsse.password = i(auth.wsse.password, 'WSSE auth password');
      break;
    case 'awsv4':
      auth.awsv4.accessKeyId = i(auth.awsv4.accessKeyId, 'AWS auth AccessKeyId');
      auth.awsv4.region = i(auth.awsv4.region, 'AWS auth Region');
      auth.awsv4.profileName = i(auth.awsv4.profileName, 'AWS auth ProfileName');
      auth.awsv4.service = i(auth.awsv4.service, 'AWS auth Service');
      auth.awsv4.sessionToken = i(auth.awsv4.sessionToken, 'AWS auth SessionToken');
      auth.awsv4.secretAccessKey = i(auth.awsv4.secretAccessKey, 'AWS auth SecretAccessKey');
      break;
    case 'oauth2':
      switch (auth.oauth2.grantType) {
        case 'authorization_code':
          auth.oauth2.accessTokenUrl = i(auth.oauth2.accessTokenUrl, 'OAuth2 Access Token Url');
          auth.oauth2.authorizationUrl = i(auth.oauth2.authorizationUrl, 'OAuth2 Authorization Url');
          auth.oauth2.callbackUrl = i(auth.oauth2.callbackUrl, 'OAuth2 Callback Url');
          auth.oauth2.clientId = i(auth.oauth2.clientId, 'OAuth2 Client Id');
          auth.oauth2.clientSecret = i(auth.oauth2.clientSecret, 'OAuth2 Client secret');
          auth.oauth2.scope = i(auth.oauth2.scope, 'OAuth2 Scope');
          auth.oauth2.state = i(auth.oauth2.state, 'OAuth2 State');
          break;
        case 'client_credentials':
          auth.oauth2.accessTokenUrl = i(auth.oauth2.accessTokenUrl, 'OAuth2 Access Token Url');
          auth.oauth2.clientId = i(auth.oauth2.clientId, 'OAuth2 Client Id');
          auth.oauth2.clientSecret = i(auth.oauth2.clientSecret, 'OAuth2 Client secret');
          auth.oauth2.password = i(auth.oauth2.password, 'OAuth2 Password');
          auth.oauth2.username = i(auth.oauth2.username, 'OAuth2 Username');
          auth.oauth2.scope = i(auth.oauth2.scope, 'OAuth2 Scope');
          break;
        case 'password':
          auth.oauth2.accessTokenUrl = i(auth.oauth2.accessTokenUrl, 'OAuth2 Access Token Url');
          auth.oauth2.clientId = i(auth.oauth2.clientId, 'OAuth2 Client Id');
          auth.oauth2.clientSecret = i(auth.oauth2.clientSecret, 'OAuth2 Client Secret');
          auth.oauth2.password = i(auth.oauth2.password, 'OAuth2 Password');
          auth.oauth2.username = i(auth.oauth2.username, 'OAuth2 Username');
          auth.oauth2.scope = i(auth.oauth2.scope, 'OAuth2 Scope');
          break;
      }
  }
}

function interpolateBody(context: RequestContext, i: InterpolationShorthandFunction) {
  const body = context.requestItem.request.body;
  switch (body.mode) {
    case 'text':
      body.text = i(body.text, '');
      break;
    case 'json':
      if (typeof body.json !== 'string') {
        body.json = stringify(body.json);
      }
      if (body.json === undefined) {
        break;
      }
      // Always decomment the body. Tolerant flag will ensure no error is thrown when json is invalid
      body.json = decomment(body.json, { tolerant: true });
      body.json = i(body.json, 'Json body');
      try {
        // @ts-ignore
        body.json = parse(body.json, (value) => {
          // Convert the Lossless number into whatever fits best
          return new LosslessNumber(value).valueOf();
        });
      } catch {}
      break;
    case 'multipartForm': {
      let pos = 0;
      for (const item of body.multipartForm) {
        pos++;
        if (item.type === 'text') {
          item.value = i(item.value, `Multipart form value #${pos}`);
        }
        item.name = i(item.name, `Multipart form name #${pos}`);
      }
      break;
    }
    case 'formUrlEncoded': {
      let pos = 0;
      for (const item of body.formUrlEncoded) {
        pos++;
        item.value = i(item.value, `Form field value #${pos}`);
        item.name = i(item.name, `Form field name #${pos}`);
      }
      break;
    }
    case 'xml':
      body.xml = i(body.xml, 'XML body');
      break;
    case 'sparql':
      body.sparql = i(body.sparql, 'SPARQL body');
      break;
    case 'graphql':
      body.graphql.query = i(body.graphql.query, 'GraphQL query');
      body.graphql.variables = i(body.graphql.variables, 'GraphQL variables');
      break;
  }
}

export function interpolateRequest(context: RequestContext) {
  const combinedVars: Record<string, unknown> = {
    ...context.variables.global,
    ...context.variables.collection,
    ...context.variables.environment,
    ...context.variables.folder,
    ...context.variables.request,
    ...context.variables.runtime,
    ...context.variables.process
  };

  const interpolationResults: Record<string, { before: string; after: string }> = {};
  const interpolateShorthand: InterpolationShorthandFunction = (before, name) => {
    const after = interpolate(before, combinedVars);
    // Only log when something has changed
    if (before !== after) {
      interpolationResults[name] = { before, after };
    }
    return after;
  };

  interpolateRequestItem(context, interpolateShorthand);
  interpolateBody(context, interpolateShorthand);
  interpolateAuth(context, interpolateShorthand);
  interpolateBrunoConfigOptions(context, interpolateShorthand);

  context.debug.log('Interpolated request', interpolationResults);
}
