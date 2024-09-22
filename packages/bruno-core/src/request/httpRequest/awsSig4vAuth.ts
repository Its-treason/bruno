import crypto from 'node:crypto';
import { Readable } from 'stream';
import { RequestOptions } from 'node:http';
import { RequestAuthSchema } from 'packages/bruno-schema/dist';

function createAwsV4AuthHeaders(
  opts: RequestOptions,
  body: string | Buffer = '',
  authConfig: Extract<RequestAuthSchema, { mode: 'awsv4' }>
): Record<string, string> {
  const method = opts.method!.toUpperCase();
  const headers = opts.headers as Record<string, string | string[]>;
  const { hostname, pathname, searchParams } = new URL(opts.path!, `${opts.protocol}//${opts.hostname}`);

  const amzDate = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);

  // Set the host header if not present, otherwise undici will set it later
  if (!headers['host']) {
    headers['host'] = hostname;
  }

  // Reference: https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html
  // Task 1: Create a Canonical Request
  const canonicalHeaders = Object.keys(headers)
    .filter((key) => key && headers[key])
    .sort()
    .map((key) => {
      const val = headers[key];
      if (Array.isArray(val)) {
        return val.map((headerVal) => `${key.toLowerCase()}:${headerVal.trim()}`).join('\n');
      }
      return `${key.toLowerCase()}:${val.trim()}`;
    })
    .join('\n');
  const signedHeaders = Object.keys(headers)
    .filter((key) => key && headers[key])
    .map((key) => key.toLowerCase())
    .sort()
    .join(';');

  const canonicalQueryString = new URLSearchParams([...searchParams.entries()].sort()).toString();

  if (body instanceof Readable) {
    throw new Error(`TODO: Implement readable conversion`);
  }
  if (body instanceof FormData) {
    throw new Error(`TODO: Implement FormData conversion`);
  }

  const hashedBody = crypto
    .createHash('sha256')
    .update(body || '')
    .digest('hex');
  const canonicalRequest = `${method}\n${pathname}\n${canonicalQueryString}\n${canonicalHeaders}\n\n${signedHeaders}\n${hashedBody}`;

  // Task 2: Create a String to Sign
  const credentialScope = `${dateStamp}/${authConfig.awsv4.region}/${authConfig.awsv4.service}/aws4_request`;
  const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${hashedCanonicalRequest}`;

  // Task 3: Calculate Signature
  const secret = authConfig.awsv4.secretAccessKey;
  const dateKey = crypto
    .createHmac('sha256', 'AWS4' + secret)
    .update(dateStamp)
    .digest();
  const dateRegionKey = crypto.createHmac('sha256', dateKey).update(authConfig.awsv4.region).digest();
  const dateRegionServiceKey = crypto.createHmac('sha256', dateRegionKey).update(authConfig.awsv4.service).digest();
  const signingKey = crypto.createHmac('sha256', dateRegionServiceKey).update('aws4_request').digest();
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  // Task 4: Create the final headers
  const authorization = `AWS4-HMAC-SHA256 Credential=${authConfig.awsv4.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    'x-amz-date': amzDate,
    'x-amz-security-token': authConfig.awsv4.sessionToken,
    authorization
  };
}

export function addAwsAuthHeader(
  authConfig: Extract<RequestAuthSchema, { mode: 'awsv4' }>,
  requestOptions: RequestOptions,
  body?: string | Buffer
): void {
  const authHeaders = createAwsV4AuthHeaders(requestOptions, body, authConfig);

  requestOptions.headers = {
    ...requestOptions.headers,
    ...authHeaders
  };
}
