import { RequestContext, Response, UndiciRequest } from '../types';
import { Client, Dispatcher } from 'undici';
import { createWriteStream } from 'node:fs';
import { join } from 'node:path';
import { Timeline } from '../Timeline';
import { URL } from 'node:url';
import os from 'node:os';
import { handleDigestAuth } from './digestAuth';
import { createAwsV4AuthInterceptor } from './awsSig4vAuth';
import { DebugLogger } from '../DebugLogger';

function createFinalDataInterceptor(
  url: string,
  debugLogger: DebugLogger,
  callback: (method: string, finalHeader: Record<string, string>) => void
): Dispatcher.DispatcherInterceptor {
  return (dispatch) => {
    return (opts, handler) => {
      // The type for the headers is waaaaaay to broad, we only use Record<string, string>
      opts.headers = opts.headers as Record<string, string>;

      const { hostname } = new URL(url);
      opts.headers['host'] = hostname;

      callback(opts.method, opts.headers as Record<string, string>);

      debugLogger.log('Final request options', {
        options: opts,
        url
      });

      return dispatch(opts, handler);
    };
  };
}

// This is basically copied from: https://github.com/nodejs/undici/blob/main/lib/handler/redirect-handler.js#L91
function handleRedirect(
  statusCode: number,
  headers: Record<string, string | string[] | undefined>,
  originalRequest: UndiciRequest
): false | UndiciRequest {
  // Should only be counted with one of these status codes
  if (![300, 301, 302, 303, 307, 308].includes(statusCode)) {
    return false;
  }

  // Check if we got a Location header
  const newLocation = Array.isArray(headers['location']) ? headers['location'][0] : headers['location'];
  if (!newLocation) {
    return false;
  }

  // This will first build the Original request URL and then merge it with the location header.
  // URL will automatically handle a relative Location header e.g. /new-site or an absolute location
  // e.g. https://my-new-site.net
  const newLocationUrl = new URL(newLocation, new URL(originalRequest.options.path, originalRequest.url));
  originalRequest.url = newLocationUrl.origin;
  originalRequest.options.path = `${newLocationUrl.pathname}${newLocationUrl.search}`;
  originalRequest.redirectDepth++;
  return originalRequest;
}

function handleServerResponse(
  statusCode: number,
  header: Record<string, string | string[] | undefined>,
  originalRequest: UndiciRequest,
  context: RequestContext
): { nextRequest: UndiciRequest | null; info: string } {
  const redirect = handleRedirect(statusCode, header, originalRequest);
  if (redirect !== false) {
    // Use the users redirect limit or default to 25
    const redirectLimit = context.requestItem.request.maxRedirects ?? 25;
    if (redirect.redirectDepth > redirectLimit) {
      return { nextRequest: null, info: 'Server returned redirect, but redirect limit is reached' };
    }

    return { nextRequest: redirect, info: 'Server returned redirect' };
  }

  const digestAuthContinue = handleDigestAuth(statusCode, header, originalRequest, context.requestItem.request.auth);
  if (digestAuthContinue) {
    return { nextRequest: digestAuthContinue, info: 'Server returned Digest-Auth details' };
  }

  return { nextRequest: null, info: 'Final response' };
}

function parseEncodingFromResponseHeaders(headers: Record<string, string | string[] | undefined>): BufferEncoding {
  const encodingHeaders = headers['content-type'];
  if (!encodingHeaders) {
    return 'utf-8';
  }
  const headerValue = Array.isArray(encodingHeaders) ? encodingHeaders[0] ?? '' : encodingHeaders;
  const charset = /charset=([^()<>@,;:"/[\]?.=\s]*)/i.exec(headerValue);

  // TODO: Check if the encoding is valid / usable by node
  // @ts-ignore
  return charset?.at(1) ?? 'utf-8';
}

async function doRequest(
  undiciRequest: Exclude<RequestContext['undiciRequest'], undefined>,
  targetPath: string,
  context: Readonly<RequestContext>
): Promise<RequestContext['response']> {
  const startTime = performance.now();

  let finalRequestHeaders: Record<string, string>;
  let finalMethod: string;
  const headerInterceptor = createFinalDataInterceptor(undiciRequest.url, context.debug, (method, finalHeader) => {
    finalMethod = method;
    finalRequestHeaders = finalHeader;
  });

  // Not that interceptors are executed in reverse order
  const interceptors = [headerInterceptor];
  if (context.requestItem.request.auth.mode === 'awsv4') {
    interceptors.push(createAwsV4AuthInterceptor(undiciRequest.url, context.requestItem.request.auth));
  }

  const client = new Client(undiciRequest.url, {
    strictContentLength: false
  }).compose(interceptors);

  // The stream callback fires when the first response bytes are received.
  // And we have to wait for all other callbacks and the stream to resolve
  let resolve: (response: Response | undefined) => void, reject: (e: unknown) => void;
  const responseDataPromise = new Promise<Response | undefined>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  // Write the signal here, because the reference to the signal in undiciOptions is lost after a reqeust
  undiciRequest.options.signal = context.abortController?.signal;

  await client.stream(undiciRequest.options, ({ headers, statusCode }) => {
    const { nextRequest, info } = handleServerResponse(statusCode, headers, structuredClone(undiciRequest), context);

    context.timeline!.add({
      requestMethod: finalMethod,
      requestUrl: undiciRequest.url + undiciRequest.options.path,
      requestHeaders: finalRequestHeaders,
      responseHeader: headers,
      statusCode,
      info
    });

    if (nextRequest !== null) {
      doRequest(nextRequest, targetPath, context).then(resolve).catch(reject);
      // TODO: In the future we could write the start of the response into the timeline
      // Write this response to /dev/null
      return createWriteStream(os.devNull);
    }

    const encoding = parseEncodingFromResponseHeaders(headers);

    resolve({
      headers,
      statusCode,
      encoding,
      path: targetPath,
      responseTime: Math.round(performance.now() - startTime)
    });

    return createWriteStream(targetPath, { autoClose: true, encoding });
  });

  return await responseDataPromise;
}

export async function undiciRequest(context: RequestContext) {
  // TODO: Handle redirects in a way that allow to collect all headers
  // TODO: Pass timeout here
  // TODO: Proxy and CA-Cert config
  const targetPath = join(context.dataDir, context.requestItem.uid);
  context.timeline = new Timeline();

  if (!context.undiciRequest) {
    throw new Error('undiciRequest is not set, but should be at this point');
  }
  context.response = await doRequest(context.undiciRequest, targetPath, context);
}