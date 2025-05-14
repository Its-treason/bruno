import { BrunoRequestOptions, RequestContext, RequestItem } from '../types';
import { handleDigestAuth } from './digestAuth';
import { addAwsAuthHeader } from './awsSig4vAuth';
import { HttpRequestInfo, execHttpRequest } from './httpRequest';
import { Timeline } from '../dataObject/Timeline';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CookieJar } from 'tough-cookie';
import { URL } from 'node:url';
import { decodeServerResponse } from './decodeResponseBody';
import { DebugLogger } from '../dataObject/DebugLogger';

export async function makeHttpRequest(context: RequestContext) {
  if (context.timeline === undefined) {
    context.timeline = new Timeline();
  }

  const allowH2 = context.collection.brunoConfig.h2 === true;

  let body = context.httpRequest?.body;
  let requestOptions = context.httpRequest!.options;

  while (true) {
    addMandatoryHeader(requestOptions, body);
    if (context.preferences.request.sendCookies) {
      await addCookieHeader(requestOptions, context.requestItem, context.cookieJar);
    }
    if (context.requestItem.request.auth.mode === 'awsv4') {
      addAwsAuthHeader(context.requestItem.request.auth, requestOptions, body);
    }

    // Deference the original options
    context.debug.log('Request', {
      options: {
        ...requestOptions,
        agent: undefined // agent cannot be stringified
      }
    });
    const response = await execHttpRequest(requestOptions, allowH2, body, context.abortController?.signal);

    const nextRequest = await handleServerResponse(context, requestOptions, response);
    context.timeline?.add(response);
    if (nextRequest === false) {
      await handleFinalResponse(response, context);
      break;
    }

    // See -> `handleRedirect` function
    if (requestOptions.method !== 'GET' && nextRequest.method === 'GET') {
      body = undefined;
    }

    requestOptions = nextRequest;
  }
}

function addMandatoryHeader(requestOptions: BrunoRequestOptions, body?: string | Buffer) {
  let hostHeader = requestOptions.hostname;
  if (requestOptions.port) {
    hostHeader += `:${requestOptions.port}`;
  }
  requestOptions.headers!['host'] = hostHeader;

  if (body !== undefined) {
    const length = Buffer.isBuffer(body) ? body.length : Buffer.byteLength(body);
    requestOptions.headers!['content-length'] = String(length);
  }
}

async function addCookieHeader(
  requestOptions: BrunoRequestOptions,
  originalRequest: RequestItem,
  cookieJar: CookieJar
) {
  const currentUrl = urlFromRequestOptions(requestOptions);
  const cookieHeader = await cookieJar.getCookieString(currentUrl.href);
  if (cookieHeader) {
    requestOptions.headers!['cookie'] = [cookieHeader];

    // Append all user defined cookie headers: https://github.com/usebruno/bruno/issues/2102
    const originalCookieHeaders = originalRequest.request.headers.filter(
      (header) => header.name.toLowerCase() === 'cookie' && header.enabled
    );
    for (const originalCookieHeader of originalCookieHeaders) {
      requestOptions.headers!['cookie'].push(originalCookieHeader.value);
    }
  }
}

async function handleServerResponse(
  context: RequestContext,
  originalRequest: BrunoRequestOptions,
  response: HttpRequestInfo
): Promise<BrunoRequestOptions | false> {
  const request = {
    // Agent cannot be cloned
    ...structuredClone({ ...originalRequest, agent: undefined }),
    agent: originalRequest.agent
  };

  // We did not get a response / an error occurred
  if (response.statusCode === undefined) {
    return false;
  }

  try {
    // Decode a body that is encoded with gzip, brotl etc. if the "content-encoding" header is set
    const encodingResult = await decodeServerResponse(response);
    if (encodingResult) {
      context.debug.log('Decoded response body', { encoding: encodingResult });
    }
  } catch (error) {
    context.debug.log('Error decoding response body', { error });
  }

  if (context.preferences.request.storeCookies) {
    await storeCookies(context.cookieJar, request, response, context.debug);
  }

  const mustRedirect = handleRedirect(request, response);
  if (mustRedirect) {
    // Use the users redirect limit or default to 25
    const redirectLimit = context.requestItem.request.maxRedirects ?? 25;
    if (context.httpRequest!.redirectDepth >= redirectLimit) {
      response.info = 'Server returned redirect, but redirect limit is reached';
      return false;
    }
    context.httpRequest!.redirectDepth++;
    response.info = 'Server returned redirect';
    return request;
  }

  const digestAuthContinue = handleDigestAuth(
    response.statusCode!,
    response.headers!,
    request,
    context.requestItem.request.auth
  );
  if (digestAuthContinue) {
    response.info = 'Server returned DigestAuth details';
    return request;
  }

  response.info = 'Final response';
  return false;
}

// This is based on: https://github.com/nodejs/undici/blob/main/lib/handler/redirect-handler.js#L93
function handleRedirect(request: BrunoRequestOptions, response: HttpRequestInfo): boolean {
  // Should only be counted with one of these status codes
  if (response.statusCode === undefined || ![300, 301, 302, 303, 307, 308].includes(response.statusCode)) {
    return false;
  }

  // Check if we got a Location header
  const newLocation = Array.isArray(response.headers!) ? response.headers![0] : response.headers!['location'];
  if (!newLocation) {
    return false;
  }

  // This will first build the Original request URL and then merge it with the location header.
  // URL will automatically handle a relative Location header e.g. /new-site or an absolute location
  // e.g. https://my-new-site.net
  let newLocationUrl;
  try {
    newLocationUrl = new URL(newLocation, new URL(request.path, `${request.protocol}//${request.hostname}`));
  } catch (error) {
    throw new Error(
      'Could not create Url to redirect location! Server returned this location: ' +
        `"${newLocation}", old path: "${request.path}" & old base: "${request.protocol}//${request.hostname}". ` +
        `Original error: ${error}`
    );
  }

  if (
    // https://tools.ietf.org/html/rfc7231#section-6.4.2 & https://datatracker.ietf.org/doc/html/rfc7231#section-6.4.3
    ((response.statusCode === 301 || response.statusCode === 302) && request.method === 'POST') ||
    // https://datatracker.ietf.org/doc/html/rfc7231#section-6.4.4
    (response.statusCode === 303 && request.method !== 'HEAD')
  ) {
    request.method = 'GET';

    for (const headerName in request.headers) {
      if (headerName.startsWith('content-')) {
        delete request.headers[headerName];
      }
    }
  }

  request.hostname = newLocationUrl.hostname;
  request.port = newLocationUrl.port;
  request.protocol = newLocationUrl.protocol;
  request.path = `${newLocationUrl.pathname}${newLocationUrl.search}`;

  return true;
}

async function storeCookies(
  cookieJar: CookieJar,
  request: BrunoRequestOptions,
  response: HttpRequestInfo,
  debug: DebugLogger
) {
  const currentUrl = urlFromRequestOptions(request);

  for (const cookieString of response.headers!['set-cookie'] ?? []) {
    try {
      await cookieJar.setCookie(cookieString, currentUrl.href);
    } catch (error) {
      // tough-cookie does the same checks a browser does before saving a cookie and will error if something is wrong
      debug.log('Could not store cookie', { error, cookieString, url: currentUrl.href });
    }
  }
}

async function handleFinalResponse(response: HttpRequestInfo, context: RequestContext) {
  if (response.error || response.statusCode === undefined) {
    throw new Error(response.error || 'Server did not return a response');
  }

  const targetPath = join(context.dataDir, context.uid);
  await writeFile(targetPath, response.responseBody!);

  context.response = {
    path: targetPath,
    headers: response.headers!,
    responseTime: response.responseTime!,
    statusCode: response.statusCode,
    size: response.responseBody?.length ?? 0
  };
}

export function urlFromRequestOptions(opts: BrunoRequestOptions): URL {
  let port = '';
  if (opts.port) {
    port = `:${port}`;
  }
  return new URL(`${opts.protocol}//${opts.hostname}${port}${opts.path}`);
}
