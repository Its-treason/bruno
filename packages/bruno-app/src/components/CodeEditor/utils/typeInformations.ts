const bruTypeInfo = `
interface Bruno {
  interpolate(target: unknown): string | unknown;
  cwd(): string;
  getEnvName(): string | null;
  getProcessEnv(key: string): unknown;
  hasEnvVar(key: string): boolean;
  getEnvVar(key: string): any;
  setEnvVar(key: string, value: any): void;
  hasVar(key: string): boolean;
  setVar(key: string, value: any): void;
  deleteVar(key: string): void;
  getVar(key: string): any;
  getRequestVar(key: string): unknown;
  getCollectionVar(key: string): unknown;
  getFolderVar(key: string): unknown;
  setNextRequest(nextRequest: string): void;
  sleep(ms: number): Promise<void>;
}
declare const bru: Bruno;
`;

const reqTypeInfo = `
interface BrunoRequest {
  /**
   * Url of the request. Before variable placeholder interpolation.
   */
  url: string;
  method: string;
  headers: any;
  body: any;
  timeout: number;
  getUrl(): string;
  setUrl(url: string): void;
  getMethod(): string;
  setMethod(method: string): void;
  getHeader(name: string): string;
  getHeaders(): any;
  setHeader(name: string, value: string): void;
  setHeaders(data: any): void;
  getBody(): any;
  setBody(data: any): void;
  setMaxRedirects(maxRedirects: number): void;
  getTimeout(): number;
  setTimeout(timeout: number): void;
  disableParsingResponseJson(): void;
  getExecutionMode(): 'standalone' | 'runner';
};
declare const req: BrunoRequest;
`;

const resTypeInfo = `
Interface BrunoResponse {
  status: number;
  statusText: string;
  headers: any;
  body: any;
  responseTime: number;
  getStatus(): number;
  getStatusText(): string;
  getHeader(name: string): string;
  getHeaders(): any;
  getBody(): any;
  getResponseTime(): number;
  setBody(newBody: unknown): void;
};
declare const res: BrunoResponse;
`;

let chaiTypeInfo = '';
fetch('/monacoChaiTypeInfo.d.ts')
  .then((res) => {
    return res.text();
  })
  .then((text) => {
    chaiTypeInfo = text;
  });

export type TypeInfoTargets = 'bru' | 'req' | 'res' | 'chai';

export function getExtraLibraries(needed: TypeInfoTargets[]): string {
  return needed
    .map((target) => {
      switch (target) {
        case 'bru':
          return bruTypeInfo;
        case 'chai':
          return chaiTypeInfo;
        case 'req':
          return reqTypeInfo;
        case 'res':
          return resTypeInfo;
      }
    })
    .join('\n\n');
}
