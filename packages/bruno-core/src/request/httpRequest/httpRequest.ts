import { request as requestHttp, STATUS_CODES } from 'node:http';
import { Agent, request as requestHttps } from 'node:https';
import http2, { IncomingHttpHeaders } from 'node:http2';
import { Buffer } from 'node:buffer';
import { BrunoRequestOptions } from '../types';
import tls, { TLSSocket } from 'node:tls';
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
  remoteAddress?: string;
  remotePort?: number;
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

  // HTTP server usually do not support http2
  // I don't think proxy-agents don't work with http2.
  if (options.protocol === 'http:' || options.agent) {
    return makeHttp1Request(info, options, body);
  }

  const [supportHttp2, tlsSocket] = await checkIfHttp2IsSupported(info, options);
  if (supportHttp2) {
    return makeHttp2Request(info, options, tlsSocket, body);
  }
  // Create a new socket for the http1 request. Reusing the tlsSocket did cause ssl error when making the https request
  tlsSocket?.destroy();

  return makeHttp1Request(info, options, body);
}

async function checkIfHttp2IsSupported(info: HttpRequestInfo, options: BrunoRequestOptions) {
  const socketPromise = new Promise<TLSSocket>((resolve, reject) => {
    const tlsSocket = tls.connect({
      host: options.hostname,
      port: options.port ? Number(options.port) : 443,
      rejectUnauthorized: false,
      ALPNProtocols: ['h2', 'http/1.1']
    });

    tlsSocket.on('ready', () => {
      info.remoteAddress = tlsSocket.remoteAddress;
      info.remotePort = tlsSocket.remotePort;
    });

    tlsSocket.on('secureConnect', () => {
      info.sslInfo = collectSslInfo(tlsSocket, options.hostname);
      if (!info.sslInfo.authorized && options.abortOnInvalidSsl) {
        tlsSocket.destroy(
          new Error(
            `${info.sslInfo.authorizationError} (This can be ignore in app preferences: "SSL/TLS Certificate Verification")`
          )
        );
      }
      resolve(tlsSocket);
    });

    tlsSocket.on('error', reject);
  });

  let socket;
  try {
    socket = await socketPromise;
  } catch (e) {
    return [false, null] as const;
  }

  return [socket.alpnProtocol === 'h2', socket] as const;
}

async function makeHttp1Request(info: HttpRequestInfo, options: BrunoRequestOptions, body?: string | Buffer) {
  const req = options.protocol === 'http:' ? requestHttp(options) : requestHttps(options);

  let resolve: () => void;
  const reqPromise = new Promise<void>((res) => {
    resolve = res;
  });

  let responseBuffers: Buffer[] = [];

  req.on('socket', (socket: TLSSocket) => {
    info.sslInfo = false;
    socket.on('ready', () => {
      info.remoteAddress = socket.remoteAddress;
      info.remotePort = socket.remotePort;
    });
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

  // Explicitly destroy the socket here, because node will sometimes keep the connection open.
  // Then then causes the socket.on("ready") and socket.on("secureConnect") events not to be triggered
  req.socket?.destroy();
}

const { HTTP2_HEADER_METHOD, HTTP2_HEADER_PATH, HTTP2_HEADER_SCHEME, HTTP2_HEADER_AUTHORITY } = http2.constants;

async function makeHttp2Request(
  info: HttpRequestInfo,
  options: BrunoRequestOptions,
  socket: TLSSocket,
  body?: string | Buffer
) {
  let resolve: () => void;
  let reject: (err: Error) => void;
  const reqPromise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  let session: http2.ClientHttp2Session | null = null;
  try {
    session = http2.connect(`https://${options.hostname}`, {
      createConnection: () => socket
    });

    session.on('error', (err) => {
      reject(new Error(`Could not create HTTP/2 session: ${err.message}`));
      session?.destroy();
    });

    const headers: Record<string, string> = {
      [HTTP2_HEADER_METHOD]: options.method,
      [HTTP2_HEADER_PATH]: options.path,
      [HTTP2_HEADER_SCHEME]: 'https',
      [HTTP2_HEADER_AUTHORITY]: options.hostname,
      ...(options.headers as Record<string, string>)
    };

    // Add 'endStream' to prevent "write after end error": https://stackoverflow.com/a/78867724
    const stream = session.request(headers, { endStream: false });

    stream.on('error', (err) => {
      reject(new Error(`HTTP/2 stream error: ${err.message}`));
      session?.destroy();
    });

    const responseBuffers: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => {
      responseBuffers.push(chunk);
    });

    stream.on('response', (headers: IncomingHttpHeaders) => {
      stream.on('end', () => {
        (info.statusCode = Number(headers[':status'])), (info.statusMessage = STATUS_CODES[info.statusCode]);
        info.httpVersion = '2';

        info.headers = {};
        for (const [name, value] of Object.entries(headers)) {
          if (!name.startsWith(':') && value !== undefined) {
            info.headers[name] = Array.isArray(value) ? value : [value];
          }
        }

        info.responseBody = Buffer.concat(responseBuffers);

        // Clean up
        stream.close();
        session?.close();

        resolve();
      });
    });

    // Send body if present
    if (body) {
      stream.write(body);
    }

    stream.end();

    await reqPromise;
  } finally {
    session?.destroy();
  }
}
