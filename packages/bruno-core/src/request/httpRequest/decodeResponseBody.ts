import { promisify } from 'node:util';
import zlib from 'node:zlib';
import { HttpRequestInfo } from './httpRequest';

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
  if (!contentEncodingHeaders) {
    return null;
  }

  const contentEncoding = contentEncodingHeaders[0].toLowerCase();
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
    default:
      return null;
  }
}
