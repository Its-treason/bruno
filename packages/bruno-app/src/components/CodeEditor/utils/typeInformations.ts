const bruTypeInfo = `
/**
 * Allows for requiring external modules or scripts. Note that modules must be whitelisted before use.
 */
declare const require: (module: string) => any;

/**
 * Object with common utility function for Bruno.
 * @see {@link https://docs.usebruno.com/scripting/javascript-reference#bru} Documentation 
 * @see {@link https://github.com/Its-treason/bruno/blob/lazer/packages/bruno-core/src/request/runtime/dataObject/Bru.ts} Source code 
 */
declare const bru: {
  /**
   * Interpolates a string that contains Bruno variable templates. Variables from all sources.
   * 
   * This function is only available in Bruno lazer.
   */
  interpolate(target: unknown): string | unknown;
  /**
   * Returns the location of the current collection as an absolute path.
   */
  cwd(): string;
  /**
   * Returns the name of the currently selected environment. Null if no environment is selected.
   */
  getEnvName(): string | null;
  /**
   * Returns a process environment variable by name. Returns null if the variable is not set.
   */
  getProcessEnv(key: string): string|null;
  /**
   * Checks if an environment variable exists. 
   */
  hasEnvVar(key: string): boolean;
  /**
   * Returns the value of a environment variable by name.
   */
  getEnvVar(key: string): any;
  /**
   * Returns the value of a global variable by name.
   */
  getGlobalEnvVar(key: string): any;
  /**
   * Updates an environment variable. Note that the value is not written to disk and only saved temporary.
   * 
   * @throws If the "key" contains invalid characters.
   */
  setGlobalEnvVar(key: string, value: unknown): void;
  /**
   * Updates an environment variable. Note that the value is not written to disk and only saved temporary.
   * 
   * @throws If the "key" contains invalid characters.
   */
  setEnvVar(key: string, value: any): void;
  /**
   * Checks if an runtime variable exists. 
   */
  hasVar(key: string): boolean;
  /**
   * Updates a runtime variable.
   * 
   * @throws If the "key" contains invalid characters.
   */
  setVar(key: string, value: any): void;
  /**
   * Deletes a runtime variable.
   * 
   * @throws If the "key" contains invalid characters.
   */
  deleteVar(key: string): void;
  /**
   * Returns the value of an runtime variable by name.
   */
  getVar(key: string): any;
  /**
   * Returns the value of an request variable by name.
   */
  getRequestVar(key: string): unknown;
  /**
   * Returns the value of an collection variable by name.
   */
  getCollectionVar(key: string): unknown;
  /**
   * Returns the value of an folder variable by name.
   */
  getFolderVar(key: string): unknown;
  /**
   * Determines the next request to execute withing the request runner.
   */
  setNextRequest(nextRequest: string): void;
  /**
   * Executes a request from the current collection. Path must be relative from to collection root.
   * Throws an error if the request does not exist.
   */
  runRequest(requestPath: string): Promise<{
    data: any;
    headers: Record<string, string>;
    duration: number;
    size: number;
    status: number;
    statusText: string;
  }>;
  /**
   * Returns a Promise that will resolve after the given time is over.
   * The promise must be awaited, for the sleep to take effect.
   */
  sleep(ms: number): Promise<void>;
  /**
   * Creates a Visualization in the response tab.
   * This is not yet implemented in lazer!
   */
  visualize(type: 'table'|'html', config: any): void;

  runner: {
    /**
     * Sets the next request to execute withing the request runner.
     */
    setNextRequest(nextRequestName: string): void;
    /**
     * Skips the current request in a test run. Only works in the pre-request script.
     */
    skipRequest(): void;
    /**
     * Stops the runner after the current request.
     */
    stopExecution(): void;
  }
};
`;

const reqTypeInfo = `
/**
 * Object representing a request made by Bruno.
 * @see {@link https://docs.usebruno.com/scripting/javascript-reference#request} Documentation 
 * @see {@link https://github.com/Its-treason/bruno/blob/lazer/packages/bruno-core/src/request/runtime/dataObject/BrunoRequest.ts} Source code 
 */
declare const req: {
  /**
   * Url of the request. Before variable placeholder interpolation.
   */
  readonly url: string;
  /**
   * HTTP request method, e.g. "GET" or "POST"
   */
  readonly method: string;
  /**
   * Headers of the request. This includes headers inherited from collection and folder level.
   */
  readonly headers: Record<string, string>;
  /**
   * The request body. The type depends on the currently selected body.
   *
   * String for "text", "sparql" and "xml" bodies.
   * 
   * Records for "Multipart Form" and "Form URL encoded".
   * 
   * For "JSON" the type fully depends on the input body.
   *
   * @throws If called after the request was sent
   */
  readonly body: any;
  /**
   * Timeout for a request in milliseconds
   */
  readonly timeout: number;
  /**
   * Returns the url of the request.
   */
  getUrl(): string;
  /**
   * Updates the request url.
   * @throws If called after the request was sent
   */
  setUrl(url: string): void;
  /**
   * Returns the HTTP request method, e.g. "GET" or "POST"
   */
  getMethod(): string;
  /**
   * Updates the HTTP request method
   * @throws If called after the request was sent
   */
  setMethod(method: string): void;
  /**
   * Returns the value of an header. Will return "null" if the header does not exist.
   */
  getHeader(name: string): string | null;
  /**
   * Returns all active headers. This includes headers from collection and folder level.
   * The header name is case insensitive.
   */
  getHeaders(): Record<string, string>;
  /**
   * Updates the value of one header. Will create a new header, if no header with the name exists.
   * The header name is case insensitive.
   * @throws If called after the request was sent
   */
  setHeader(name: string, value: string): void;
  /**
   * Overwrites all request headers. This will also overwrite headers from collection and folder level.
   */
  setHeaders(data: Record<string, string>): void;
  /**
   * Returns the current body value. The type depends on the currently selected body.
   *
   * String for "text", "sparql" and "xml" bodies.
   * 
   * Records for "Multipart Form" and "Form URL encoded".
   * 
   * For "JSON" the type fully depends on the input body.
   */
  getBody(): any;
  /**
   * Updates the request body. The type of the body must not change, this could cause internal errors otherwise.
   */
  setBody(data: any): void;
  /**
   * Current authentication mode. If request auth mode is set to inherit, this will be the mode from collection
   * @throws If called after the request was sent
   */
  readonly authMode: string;
  /**
   * Returns the current authentication mode. If request auth mode is set to inherit, this will be the mode from collection
   */
  getAuthMode(): string;
  /**
   * Updates the number of redirects Bruno will do. The default value is 25 redirects.
   * If set to 0, Bruno will not to any redirects and end with the first response received.
   * @throws If called after the request was sent
   */
  setMaxRedirects(maxRedirects: number): void;
  /**
   * Returns the timeout for a request in milliseconds (1 seconds is 1000 milliseconds).
   */
  getTimeout(): number;
  /**
   * Updates the request timeout. New timeout must be a number in milliseconds.
   * @throws If called after the request was sent
   */
  setTimeout(timeout: number): void;
  /**
   * Disables parsing of the response, if its a JSON response. The \`res.body\` will then be a string. 
   * 
   * This was implemented into Bruno to prevent issues with JSON parsing, e.g. with BigInts and other edge cases.
   * All of those problem are fixed within Bruno Lazer, so this function is not needed in lazer.
   */
  disableParsingResponseJson(): void;
  /**
   * Returns info about how the request is executed. 
   * "standalone" if the Request was called from the normal request tab.
   * "runner" if the request was called within a runner execution.
   */
  getExecutionMode(): 'standalone' | 'runner';
};
`;

const resTypeInfo = `
/**
 * Object representing the response returned from a server
 * @see {@link https://docs.usebruno.com/scripting/javascript-reference#response} Documentation 
 * @see {@link https://github.com/Its-treason/bruno/blob/lazer/packages/bruno-core/src/request/runtime/dataObject/BrunoResponse.ts} Source code 
 */
declare const res: {
  /**
   * HTTP Status code number
   */
  readonly status: number;
  /**
   * HTTP Status as Text
   */
  readonly statusText: string;
  /**
   * HTTP headers returned from the server
   */
  readonly headers: any;
  /**
   * Response body. Either a string or any if the server returned something that is JSON parsable.
   */
  readonly body: any;
  /**
   * The total time the server needed to response in milliseconds.
   */
  readonly responseTime: number;
  /**
   * Returns the HTTP status code number
   */
  getStatus(): number;
  /**
   * Returns the HTTP status code as text
   */
  getStatusText(): string;
  /**
   * Returns the value of a response header. Null if the header is not present in the response.
   */
  getHeader(name: string): string|null;
  /**
   * Returns all headers returned by the server.
   */
  getHeaders(): Record<string, string>;
  /**
   * Returns the response body. Either as string or any if the server returned something that is JSON parsable.
   */
  getBody(): any;
  /**
   * Returns the total time the server needed to response in milliseconds.
   */
  getResponseTime(): number;
  /**
   * Overwrites the response body. Useful if you want to transform the server response to better view it.
   */
  setBody(newBody: unknown): void;
} & ((path: string) => any);
`;

let chaiTypeInfo = '';
fetch('/monacoChaiTypeInfo')
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
