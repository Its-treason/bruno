import { platform, arch } from 'node:os';
import { BrunoConfig, Preferences, RequestBody, RequestContext, RequestItem } from '../types';
import { parse, stringify } from 'lossless-json';
import { URL } from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Buffer } from 'node:buffer';
import qs from 'qs';
import FormData from 'form-data';
import { Agent } from 'node:http';
import { ProxyAgent } from 'proxy-agent';
import { DebugLogger } from '../DebugLogger';
import { TlsOptions, rootCertificates } from 'node:tls';

export function createAuthHeader(requestItem: RequestItem): Record<string, string> {
  const auth = requestItem.request.auth;

  switch (auth.mode) {
    case 'basic':
      const credentials = Buffer.from(`${auth.basic.username}:${auth.basic.password}`).toString('base64');
      return {
        authorization: `Basic ${credentials}`
      };
    case 'bearer':
      return {
        authorization: `Bearer ${auth.bearer.token}`
      };
    default:
      return {};
  }
}

const bodyContentTypeMap: Record<RequestBody['mode'], string | undefined> = {
  multipartForm: undefined,
  formUrlEncoded: 'application/x-www-form-urlencoded',
  json: 'application/json',
  graphql: 'application/json',
  xml: 'text/xml',
  text: 'text/plain',
  sparql: 'application/sparql-query',
  none: undefined
};

type HeaderMetadata = {
  brunoVersion: string;
  isCli: boolean;
};

export function createDefaultRequestHeader(requestItem: RequestItem, meta: HeaderMetadata): Record<string, string> {
  const defaultHeaders: Record<string, string> = {
    'user-agent': `Bruno/${meta.brunoVersion} (${meta.isCli ? 'CLI' : 'Electron'}; Lazer; ${platform()}/${arch()})`,
    accept: '*/*',
    ...createAuthHeader(requestItem)
  };
  const contentType = bodyContentTypeMap[requestItem.request.body.mode]!;
  if (contentType) {
    defaultHeaders['content-type'] = contentType;
  }

  return defaultHeaders;
}

function getRequestHeaders(context: RequestContext, extraHeaders: Record<string, string>): Record<string, string> {
  const defaultHeader = createDefaultRequestHeader(context.requestItem, {
    isCli: false,
    brunoVersion: '1.20.0'
  });

  // Go through user header and merge them together with default header
  const headers = context.requestItem.request.headers.reduce<Record<string, string>>(
    (acc, header) => {
      if (header.enabled && header.name.trim().length > 0) {
        acc[header.name.toLowerCase()] = header.value;
      }
      return acc;
    },
    { ...defaultHeader, ...extraHeaders }
  );

  context.debug.log('Request headers', headers);

  return headers;
}

async function getRequestBody(context: RequestContext): Promise<[string | Buffer | undefined, Record<string, string>]> {
  let bodyData;
  let extraHeaders: Record<string, string> = {};

  const body = context.requestItem.request.body;
  switch (body.mode) {
    case 'multipartForm':
      const formData = new FormData();
      for (const item of body.multipartForm) {
        if (!item.enabled) {
          continue;
        }
        switch (item.type) {
          case 'text':
            formData.append(item.name, item.value);
            break;
          case 'file':
            const fileData = await fs.readFile(item.value[0]!);
            formData.append(item.name, fileData, path.basename(item.value[0]!));
            break;
        }
      }

      bodyData = formData.getBuffer();
      extraHeaders = formData.getHeaders();
      break;
    case 'formUrlEncoded':
      const combined = body.formUrlEncoded.reduce<Record<string, string[]>>((acc, item) => {
        if (item.enabled) {
          if (!acc[item.name]) {
            acc[item.name] = [];
          }
          acc[item.name].push(item.value);
        }
        return acc;
      }, {});

      bodyData = qs.stringify(combined, { arrayFormat: 'repeat' });
      break;
    case 'json':
      if (typeof body.json !== 'string') {
        bodyData = stringify(body.json) ?? '';
        break;
      }
      bodyData = body.json;
      break;
    case 'xml':
      bodyData = body.xml;
      break;
    case 'text':
      bodyData = body.text;
      break;
    case 'sparql':
      bodyData = body.sparql;
      break;
    case 'none':
      bodyData = undefined;
      break;
    case 'graphql':
      let variables;
      try {
        variables = parse(body.graphql.variables || '{}');
      } catch (e) {
        throw new Error(
          `Could not parse GraphQL variables JSON: ${e}\n\n=== Start of preview ===\n${body.graphql.variables}\n=== End of preview ===`
        );
      }
      bodyData = stringify({
        query: body.graphql.query,
        variables
      });
      break;
    default:
      // @ts-expect-error body.mode is `never` here because the case should never happen
      throw new Error(`No case defined for body mode: "${body.mode}"`);
  }

  return [bodyData, extraHeaders];
}

async function createClientCertOptions(
  certConfig: Exclude<BrunoConfig['clientCertificates'], undefined>,
  preferences: Preferences,
  host: string,
  collectionPath: string
): Promise<TlsOptions> {
  let options: TlsOptions = {};

  for (const { domain, certFilePath, keyFilePath, passphrase } of certConfig.certs) {
    // Check if the Certificate was created for the current host
    const hostRegex = '^https:\\/\\/' + domain.replaceAll('.', '\\.').replaceAll('*', '.*');
    if (!host.match(hostRegex)) {
      continue;
    }

    const absoluteCertFilePath = path.isAbsolute(certFilePath) ? certFilePath : path.join(collectionPath, certFilePath);
    const cert = await fs.readFile(absoluteCertFilePath, { encoding: 'utf8' });

    const absoluteKeyFilePath = path.isAbsolute(keyFilePath) ? keyFilePath : path.join(collectionPath, keyFilePath);
    const key = await fs.readFile(absoluteKeyFilePath, { encoding: 'utf8' });

    options = { cert, key, passphrase };
    break;
  }

  const { customCaCertificate, keepDefaultCaCertificates } = preferences.request;
  if (customCaCertificate.enabled && customCaCertificate.filePath) {
    options.ca = await fs.readFile(customCaCertificate.filePath, { encoding: 'utf8' });

    if (keepDefaultCaCertificates.enabled) {
      options.ca += '\n' + rootCertificates.join('\n');
    }
  }

  return options;
}

const protocolMap: Record<Exclude<BrunoConfig['proxy'], undefined>['protocol'], string> = {
  http: 'http:',
  https: 'https:',
  socks4: 'socks:',
  socks5: 'socks:'
};

function createProxyAgent(
  proxyConfig: Exclude<BrunoConfig['proxy'], undefined>,
  host: string,
  debug: DebugLogger,
  tlsOptions: TlsOptions,
  signal?: AbortSignal
): Agent | null {
  if (proxyConfig.enabled === false) {
    return null;
  }

  const protocol = protocolMap[proxyConfig.protocol];
  if (!protocol) {
    throw new Error(
      `Invalid proxy protocol: "${proxyConfig.protocol}". Expected one of ${Object.keys(protocolMap).join(', ')}`
    );
  }

  let auth = '';
  if (proxyConfig.auth?.enabled) {
    auth = `${proxyConfig.auth.username}:${proxyConfig.auth.password}`;
  }
  let port = '';
  if (proxyConfig.port) {
    port = `:${proxyConfig.port}`;
  }
  const proxyUrl = `${proxyConfig.protocol}://${auth}@${proxyConfig.hostname}${port}`;

  debug.log('Added ProxyAgent', { proxyUrl });
  return new ProxyAgent({
    getProxyForUrl: (url) => {
      const mustByPass = proxyConfig.bypassProxy?.split(';').some((byPass) => byPass === '*' || byPass === host);
      if (mustByPass) {
        debug.log('Proxy bypassed', { url, bypass: proxyConfig.bypassProxy });
        return '';
      }
      debug.log('Request proxied', { url, proxyUrl, bypass: proxyConfig.bypassProxy });
      return proxyUrl;
    },
    signal,
    ...tlsOptions
  });
}

export async function createHttpRequest(context: RequestContext) {
  // Make sure the URL starts with a protocol
  if (/^([-+\w]{1,25})(:?\/\/|:)/.test(context.requestItem.request.url) === false) {
    context.requestItem.request.url = `http://${context.requestItem.request.url}`;
  }

  let urlObject;
  try {
    urlObject = new URL(context.requestItem.request.url);
  } catch (error) {
    throw new Error(`Could not parse your URL "${context.requestItem.request.url}": "${error}"`);
  }

  let certOptions = {};
  if (context.collection.brunoConfig.clientCertificates) {
    certOptions = await createClientCertOptions(
      context.collection.brunoConfig.clientCertificates,
      context.preferences,
      urlObject.host,
      context.collection.pathname
    );
  }

  const [body, extraHeaders] = await getRequestBody(context);
  context.httpRequest = {
    redirectDepth: 0,
    body,
    options: {
      method: context.requestItem.request.method,
      protocol: urlObject.protocol,
      hostname: urlObject.hostname,
      port: urlObject.port,
      path: `${urlObject.pathname}${urlObject.search}${urlObject.hash}`,
      headers: getRequestHeaders(context, extraHeaders),
      timeout: context.preferences.request.timeout,
      rejectUnauthorized: context.preferences.request.sslVerification,
      ...certOptions
    }
  };

  if (context.collection.brunoConfig.proxy) {
    const agent = createProxyAgent(
      context.collection.brunoConfig.proxy,
      urlObject.host,
      context.debug,
      certOptions,
      context.abortController?.signal
    );
    if (agent) {
      context.httpRequest.options.agent = agent;
    }
  }

  context.callback.folderRequestSent(context);
}
