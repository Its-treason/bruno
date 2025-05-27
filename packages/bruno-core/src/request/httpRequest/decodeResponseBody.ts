import { promisify } from 'node:util';
import zlib from 'node:zlib';
import { HttpRequestInfo } from './httpRequest';
import { decode as msgpackDecode } from '@msgpack/msgpack';
import { stringify } from 'lossless-json';

const gunzipAsync = promisify(zlib.gunzip);
const brotliDecompressAsync = promisify(zlib.brotliDecompress);
const inflateAsync = promisify(zlib.inflate);

/**
 * Decodes the response body if an content-encoding header is set. Updates the body in place.
 * Throws an error if the decoding fails.
 *
 * Returns the encoding used for decoding or null if no encoding was present
 */
export async function decodeServerResponse(response: HttpRequestInfo): Promise<string | null | never> {
  const contentEncodingHeaders = response.headers!['content-encoding'];
  const contentEncoding = contentEncodingHeaders[0]?.toLowerCase();
  switch (contentEncoding) {
    case 'gzip':
      response.responseBody = await gunzipAsync(response.responseBody!);
      return 'gzip';
    case 'br':
      response.responseBody = await brotliDecompressAsync(response.responseBody!);
      return 'br';
    case 'deflate':
      response.responseBody = await inflateAsync(response.responseBody!);
      return 'deflate';
  }

  const contentTypeHeaders = response.headers!['content-type'] ?? [];
  const contentType = contentTypeHeaders[0]?.toLowerCase() ?? '';
  switch (true) {
    case contentType.includes('msgpack'):
      const decodedObject = msgpackDecode(response.responseBody!);
      const stringified = stringify(decodedObject) ?? '';
      response.responseBody = Buffer.from(stringified, 'utf-8');

      return 'msgpack';
  }
}
