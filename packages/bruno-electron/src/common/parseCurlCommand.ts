import {
  FormUrlEncodedBodySchema,
  HeaderSchema,
  httpRequestSchema,
  HttpRequestSchema,
  MultipartFormBodySchema,
  ParamSchema,
  RequestAuthSchema,
  RequestBodySchema
} from '@usebruno/schema';
import { parseArgs } from 'node:util';
import { ParseArgsConfig } from 'util';
import { parse } from 'shell-quote';

export function parseCurlCommand(rawCommand: string): HttpRequestSchema {
  const args = parse(rawCommand).filter((arg) => typeof arg === 'string');
  const fixedArgs = fixupArgs(args);

  const parsedCommand = argsToCurlParameter(fixedArgs);
  console.log('parsedCommand', parsedCommand);
  const request = createRequestFromCurlParameter(parsedCommand);
  console.log('request', request);
  return request;
}

function fixupArgs(args: string[]): string[] {
  if (args[0] === 'curl') {
    args.shift();
  }

  // Iterate over all args from behind, split "-XPOST" into "-X" "POST"
  for (let index = args.length - 1; index >= 0; index--) {
    const matched = args[index].match(/^-X([A-Za-z]+)$/)?.[1];
    if (!matched) {
      continue;
    }
    args.splice(Number(index), 1, '-X', matched);
  }

  return args;
}

//#region Curl parsing
const curlParseConfig = {
  options: {
    // Method
    request: { type: 'string', short: 'X' },
    get: { type: 'boolean', short: 'G' },
    head: { type: 'boolean', short: 'I' },
    // URL will either be in a parameter or as a positional argument
    url: { type: 'string' },
    // Headers
    header: { type: 'string', short: 'H', multiple: true },
    cookie: { type: 'string', short: 'b' },
    'user-agent': { type: 'string', short: 'A' },
    // Data/body
    data: { type: 'string', short: 'd' },
    'data-raw': { type: 'string' },
    'data-binary': { type: 'string' },
    'data-urlencode': { type: 'string', multiple: true },
    json: { type: 'string' },
    form: { type: 'string', short: 'F', multiple: true },
    // Auth
    user: { type: 'string', short: 'u' },
    'aws-sigv4': { type: 'string' },
    basic: { type: 'boolean' },
    digest: { type: 'boolean' },
    ntlm: { type: 'boolean' }
  },
  allowPositionals: true,
  strict: false, // Ignore unknown args
  tokens: false
} satisfies ParseArgsConfig;

function argsToCurlParameter(args: string[]) {
  return parseArgs({
    args,
    ...curlParseConfig
  });
}
//#endregion

//#region Curl to Request
function createRequestFromCurlParameter(parameter: ReturnType<typeof argsToCurlParameter>): HttpRequestSchema {
  const headers = parseHeader(parameter);
  const [url, params] = getUrlAndParameter(parameter);
  const method = getMethod(parameter);
  const auth = parseAuth(parameter);
  const body = parseBody(parameter, getBodyHintFromHeaders(headers));

  const partial: HttpRequestSchema = {
    url,
    params,
    method,
    auth,
    body,
    headers,
    // Default values for everything a Curl command has no info about
    docs: '',
    assertions: [],
    script: {
      req: '',
      res: ''
    },
    tests: '',
    vars: {
      req: [],
      res: []
    }
  };

  return httpRequestSchema.parse(partial);
}

type BodyHint = 'xml' | 'json' | 'sparql' | null;
function getBodyHintFromHeaders(headers: HeaderSchema[]): BodyHint {
  const contentTypeValue = headers.find((header) => header.name.toLowerCase() === 'content-type')?.value;
  if (!contentTypeValue) {
    return null;
  }

  switch (true) {
    case contentTypeValue === 'xml':
      return 'xml';
    case contentTypeValue.includes('json'):
      return 'json';
    case contentTypeValue.includes('sparql'):
      return 'sparql';
    default:
      return null;
  }
}

function parseBody(parameter: ReturnType<typeof argsToCurlParameter>, bodyHint: BodyHint): RequestBodySchema {
  if (typeof parameter.values.json === 'string') {
    return {
      mode: 'json',
      json: parameter.values.json
    };
  }

  if (
    typeof parameter.values['data-raw'] === 'string' ||
    typeof parameter.values['data-binary'] === 'string' ||
    typeof parameter.values['data'] === 'string'
  ) {
    const text = parameter.values['data'] || parameter.values['data-raw'] || parameter.values['data-binary'];
    const mode = bodyHint ?? 'text';
    return {
      mode,
      [mode]: String(text)
    };
  }

  if (parameter.values['data-urlencode']) {
    return {
      mode: 'formUrlEncoded',
      formUrlEncoded: parameter.values['data-urlencode'].map((line): FormUrlEncodedBodySchema => {
        const [name, ...value] = String(line).split('=');
        return {
          value: value.join('='),
          name,
          description: '',
          uid: '',
          enabled: true
        };
      })
    };
  }

  if (parameter.values['form']) {
    return {
      mode: 'multipartForm',
      multipartForm: parameter.values['form'].map((line): MultipartFormBodySchema => {
        const [name, ...value] = String(line).split('=');
        return {
          value: value.join('='),
          name,
          type: 'text',
          contentType: '',
          description: '',
          uid: '',
          enabled: true
        };
      })
    };
  }

  return { mode: 'none' };
}

function parseAuth(parameter: ReturnType<typeof argsToCurlParameter>): RequestAuthSchema {
  // https://curl.se/docs/manpage.html#-u
  let username = '';
  let password = '';
  if (typeof parameter.values.user === 'string') {
    const split = parameter.values.user.split(':');
    username = split[0];
    password = split[1] ?? '';
  }

  if (parameter.values.digest) {
    return {
      mode: 'digest',
      digest: {
        username,
        password
      }
    };
  }

  if (parameter.values.ntlm) {
    return {
      mode: 'ntlm',
      ntlm: {
        username,
        password,
        domain: ''
      }
    };
  }

  // https://curl.se/docs/manpage.html#--aws-sigv4
  if (parameter.values['aws-sigv4']) {
    // <provider1[:prvdr2[:reg[:srv]]]>
    const split = String(parameter.values['aws-sigv4']).split(':');

    return {
      mode: 'awsv4',
      awsv4: {
        accessKeyId: username,
        secretAccessKey: password,
        profileName: '',
        region: split[2] ?? '',
        service: split[3] ?? '',
        sessionToken: ''
      }
    };
  }

  if (parameter.values.basic || username) {
    return {
      mode: 'basic',
      basic: {
        username,
        password
      }
    };
  }

  // Default / Fallback
  return { mode: 'inherit' };
}

function getMethod(parameter: ReturnType<typeof argsToCurlParameter>): string {
  if (parameter.values.get) {
    return 'GET';
  } else if (parameter.values.head) {
    return 'HEAD';
  } else if (parameter.values.request) {
    return String(parameter.values.request);
  }
  return 'GET'; // Fallback
}

function getUrlAndParameter(parameter: ReturnType<typeof argsToCurlParameter>): [string, ParamSchema[]] {
  const url = typeof parameter.values.url === 'string' ? parameter.values.url : parameter.positionals.join(' ');

  const params: ParamSchema[] = [];
  try {
    // This can throw, if the URL is invalid. In that case it wouldn't contain search params anyway
    const urlObj = new URL(url);
    for (const [name, value] of urlObj.searchParams.entries()) {
      params.push({
        value,
        name,
        type: 'query',
        uid: '',
        description: '',
        enabled: true
      });
    }
  } catch (e) {}

  return [url, params] as const;
}

function parseHeader(parameter: ReturnType<typeof argsToCurlParameter>): HeaderSchema[] {
  const headers: HeaderSchema[] = [];
  for (const header of parameter.values.header || []) {
    const [name, ...value] = String(header).split(':');
    headers.push({
      name: name.trim(),
      value: value.join(':').trim(),
      uid: '',
      enabled: true,
      description: ''
    });
  }

  if (typeof parameter.values.cookie === 'string') {
    headers.push({
      name: 'cookie',
      value: parameter.values.cookie,
      uid: '',
      enabled: true,
      description: ''
    });
  }
  if (typeof parameter.values['user-agent'] === 'string') {
    headers.push({
      name: 'user-agent',
      value: parameter.values['user-agent'],
      uid: '',
      enabled: true,
      description: ''
    });
  }

  return headers;
}
//#endregion
