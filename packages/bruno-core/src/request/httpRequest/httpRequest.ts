import { request as requestHttp } from 'node:http';
import { request as requestHttps } from 'node:https';
import { Buffer } from 'node:buffer';
import { BrunoRequestOptions } from '../types';
import { DetailedPeerCertificate, PeerCertificate, TLSSocket } from 'node:tls';
import { Performance } from 'node:perf_hooks';
import { collectSslInfo, RequestSslInfo } from './collectSslInfo';

export type HttpRequestInfo = {
  // RequestInfo
  finalOptions: Readonly<BrunoRequestOptions>;
  requestBody?: string;
  // Response
  responseTime?: number;
  statusCode?: number;
  statusMessage?: String;
  headers?: Record<string, string[]>;
  httpVersion?: string;
  sslInfo?: RequestSslInfo | false;
  responseBody?: Buffer;
  error?: string;
  info?: string;
};

export async function execHttpRequest(
  options: BrunoRequestOptions,
  body?: string | Buffer,
  signal?: AbortSignal
): Promise<HttpRequestInfo> {
  const requestInfo: HttpRequestInfo = {
    finalOptions: { ...options, agent: undefined },
    requestBody: body ? body.toString().slice(0, 2048) : undefined
  };

  const startTime = performance.now();
  try {
    await doExecHttpRequest(
      requestInfo,
      {
        ...options,
        signal
      },
      body
    );
  } catch (error) {
    requestInfo.error = String(error);
  }
  requestInfo.responseTime = Math.round(performance.now() - startTime);

  return requestInfo;
}

async function doExecHttpRequest(info: HttpRequestInfo, options: BrunoRequestOptions, body?: string | Buffer) {
  if (options.protocol !== 'https:' && options.protocol !== 'http:') {
    throw new Error(`Unsupported protocol: "${options.protocol}", only "https:" & "http:" are supported`);
  }

  const req = options.protocol === 'http:' ? requestHttp(options) : requestHttps(options);

  let resolve: () => void;
  const reqPromise = new Promise<void>((res) => {
    resolve = res;
  });

  let responseBuffers: Buffer[] = [];

  req.on('socket', (socket: TLSSocket) => {
    info.sslInfo = false;
    socket.on('secureConnect', () => {
      info.sslInfo = collectSslInfo(socket, options.hostname);
      if (!info.sslInfo.authorized && options.abortOnInvalidSsl) {
        req.destroy(
          new Error(
            `${info.sslInfo.authorizationError} (This can be ignore in app preferences: "SSL/TLS Certificate Verification")`
          )
        );
      }
    });
  });

  req.on('response', (response) => {
    info.statusCode = response.statusCode;
    info.statusMessage = response.statusMessage;
    // Remove `undefined` and make it an empty array instead
    info.headers = Object.entries(response.headersDistinct).reduce<Record<string, string[]>>((acc, [key, val]) => {
      acc[key] = val === undefined ? [''] : val;
      return acc;
    }, {});
    info.httpVersion = response.httpVersion;

    response.on('data', (chunk) => {
      if (!Buffer.isBuffer(chunk)) {
        // We did not set the encoding, so it must be a Buffer here
        throw new Error('Expected data to be a buffer!');
      }

      responseBuffers.push(chunk);
    });
    response.on('end', () => {
      info.responseBody = Buffer.concat(responseBuffers);
    });
  });

  req.on('error', (err) => {
    info.error = String(err);
    if (err.name === 'AggregateError') {
      // @ts-expect-error
      info.error = err.errors.map(String).join('\n');
    }
    resolve();
  });
  req.on('close', () => {
    resolve();
  });

  if (body) {
    req.write(body);
  }
  req.end();

  await reqPromise;
}
