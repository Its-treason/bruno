import { Timings } from './Timings';
import { DebugLogger } from './DebugLogger';
import { Timeline } from './Timeline';
import { Callbacks } from './Callbacks';
import { RequestOptions } from 'node:http';
import { TlsOptions } from 'node:tls';
import { CookieJar } from 'tough-cookie';
import { RequestAuthSchema } from '@usebruno/schema';

export type RequestType = 'http-request' | 'graphql-request';

export type RequestVariable = {
  name: string;
  value: string;
  enabled: boolean;
};

export type RequestBody =
  | {
      mode: 'none';
    }
  | {
      mode: 'json';
      json: string | Record<string, unknown> | undefined;
    }
  | {
      mode: 'text';
      text: string;
    }
  | {
      mode: 'multipartForm';
      multipartForm: (
        | {
            name: string;
            value: string;
            enabled: boolean;
            type: 'text';
            contentType: string;
            uid: string;
          }
        | {
            name: string;
            value: string[];
            enabled: boolean;
            type: 'file';
            description: string;
            contentType: string;
            uid: string;
          }
      )[];
    }
  | {
      mode: 'formUrlEncoded';
      formUrlEncoded: {
        name: string;
        value: string;
        enabled: boolean;
        uid: string;
      }[];
    }
  | {
      mode: 'xml';
      xml: string;
    }
  | {
      mode: 'sparql';
      sparql: string;
    }
  | {
      mode: 'graphql';
      graphql: {
        query: string;
        variables: string;
      };
    };

// This is the request Item from the App/.bru file
export type RequestItem = {
  uid: string;
  name: string;
  type: RequestType;
  seq: number;
  request: {
    method: string;
    url: string;
    params: {
      name: string;
      value: string;
      enabled: boolean;
      type: 'path' | 'query';
    }[];
    headers: {
      name: string;
      value: string;
      enabled: boolean;
    }[];
    auth: RequestAuthSchema;
    body: RequestBody;
    script: {
      req?: string;
      res?: string;
    };
    vars: {
      req?: RequestVariable[];
      res?: RequestVariable[];
    };
    assertions: {
      enabled: boolean;
      name: string;
      value: string;
    }[];
    tests: string;
    docs: string;
    maxRedirects: number;
    timeout: number;
  };
  // e.g `my-requests.bru`
  filename: string;
  // e.g `/path/to/collection/and/my-requests.bru`
  pathname: string;
  draft: null | RequestItem;
  depth: number;
};

export type Response = {
  // Last/Final response headers
  headers: Record<string, string | string[] | undefined>;
  statusCode: number;
  responseTime: number;
  // Absolute path to response file
  path: string;
  size: number;
};

export type FolderItem = {
  uid: string;
  name: string;
  // Absolute path to folder
  pathname: string;
  collapsed: boolean;
  type: 'folder';
  items: (RequestItem | FolderItem)[];
  depth: number;
  root?: {
    request?: {
      headers: {
        name: string;
        value: string;
        enabled: boolean;
      }[];
      script?: {
        req?: string;
        res?: string;
      };
      tests?: string;
      vars: {
        req?: RequestVariable[];
        res?: RequestVariable[];
      };
    };
    docs: string;
  };
};

export type RuntimeVariables = Record<string, unknown>;

export type EnvironmentVariable = {
  name: string;
  uid: string;
  value: unknown;
  enabled: boolean;
  secret: boolean;
  // TODO: Are there more types
  type: 'text';
};

export type CollectionEnvironment = {
  name: string;
  uid: string;
  variables: EnvironmentVariable[];
};

export type Collection = {
  // e.g. '1'
  version: string;
  uid: string;
  name: string;
  // Full path to collection folder
  pathname: string;
  items: (RequestItem | FolderItem)[];
  runtimeVariables: RuntimeVariables;
  // Config json
  brunoConfig: BrunoConfig;
  settingsSelectedTab: string;
  // Unix timestamp in milliseconds
  importedAt: number;
  // TODO: Check what this does
  lastAction: null | any;
  collapsed: boolean;
  environments: CollectionEnvironment[];
  // Contains .env variables. Set with 'main:process-env-update'
  processEnvVariables?: Record<string, string>;
  root?: {
    request?: {
      auth?: RequestAuthSchema;
      headers: {
        name: string;
        value: string;
        enabled: boolean;
      }[];
      script?: {
        req?: string;
        res?: string;
      };
      tests?: string;
      vars?: {
        req?: RequestVariable[];
        res?: RequestVariable[];
      };
    };
    docs: string;
  };
};

// This should always be equal to `preferences.js` in bruno-electron
export type Preferences = {
  request: {
    sslVerification: boolean;
    customCaCertificate: {
      enabled: boolean;
      filePath: string | null;
    };
    keepDefaultCaCertificates: {
      enabled: boolean;
    };
    storeCookies: boolean;
    sendCookies: boolean;
    timeout: number;
  };
  font: {
    codeFont: string | null;
  };
  proxy: {
    mode: 'on' | 'off' | 'system';
    protocol: 'http' | 'https' | 'socks4' | 'socks5';
    hostname: string;
    port: number | null;
    auth?: {
      enabled: boolean;
      username: string;
      password: string;
    };
    bypassProxy?: string;
  };
};

export type BrunoConfig = {
  version: '1';
  name: string;
  type: 'collection';
  ignore: string[];
  proxy?: {
    enabled: 'global' | true | false;
    protocol: 'https' | 'http' | 'socks4' | 'socks5';
    hostname: string;
    port: number | null;
    auth?: {
      enabled: boolean;
      username: string;
      password: string;
    };
    bypassProxy?: string;
  };
  clientCertificates?: {
    certs: {
      domain: string;
      certFilePath: string;
      keyFilePath: string;
      passphrase: string;
    }[];
  };
  scripts: {
    additionalContextRoots: string[];
    moduleWhitelist: string[];
    filesystemAccess: {
      allow: boolean;
    };
    flow?: 'sandwich' | 'sequential';
  };
  h2?: boolean;
};

// Method, protocol, hostname and path are always set
export type BrunoRequestOptions = Omit<RequestOptions, 'host'> & {
  method: string;
  protocol: string;
  hostname: string;
  path: string;
  abortOnInvalidSsl: boolean;
} & TlsOptions;

export type RequestContext = {
  readonly uid: string;
  readonly dataDir: string;
  nextRequestName?: string;
  readonly abortController?: AbortController;
  readonly cancelToken: string;
  readonly brunoVersion: string;
  readonly environmentName?: string;
  readonly executionMode: 'standalone' | 'runner';
  readonly delay: number;

  requestItem: RequestItem;
  collection: Collection;
  readonly preferences: Preferences;
  cookieJar: CookieJar;
  variables: {
    request: Record<string, unknown>;
    runtime: Record<string, unknown>;
    collection: Record<string, unknown>;
    folder: Record<string, unknown>;
    environment: Record<string, unknown>;
    global: Record<string, unknown>;
    process: {
      process: {
        env: Record<string, string>;
      };
    };
  };

  readonly callback: Callbacks;
  readonly timings: Timings;
  readonly debug: DebugLogger;
  timeline?: Timeline;

  httpRequest?: {
    options: BrunoRequestOptions;
    body?: string | Buffer;
    redirectDepth: number;
  };

  response?: Response;
  responseBody?: unknown;
  error?: Error;

  previewModes?: {
    pretty: string | null;
    preview: string | null;
  };
};
