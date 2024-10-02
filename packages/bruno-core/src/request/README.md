# New request method

These are files related to the "new request method" which is a typescript
rewrite of Bruno's request logic. The new logic tries o be fully compatible with
Bruno's request method, but with improvements and bug fixes.

## Code Structure

The main file for handling a request is the `index.ts` in it the `RequestContext`
is created and all other functions are called within the `doRequest` function.
The `RequestContext` includes everything needed for the request, like
environment variables, the collection and the request itself. The Context is
passed to everything function and updated throughout the request execution by
reference.

Bigger files with more functions are best read from bottom to top. The "entrypoint" or
exported function mostly on the bottom of the files and function at the top are
called later from the entrypoint or from other function within. All files
(except `createHttpRequest.ts`) only export one function.

The code is structured in different folder based on when its used in the request
process.

- `preRequest` Everything that happens before the request is sent like
  evaluation of pre-request variables, script execution or variable
  interpolation.
- `httpRequest` Everything need to execute the request, including functions for
  handling redirects, collecting metadata and working with compressed responses.
- `postRequest` Like `preRequest` but for everything that needs to be done after
  the request ran, like running tests or evaluating post request variables.

There are also several other files:

- `Callbacks.ts`: The during the request different events must be sent to the
  renderer process like updates to environment variables or cookies. Because
  this is a sub module that is mend to be used with the CLI, the callbacks are
  optional and defined in the electron package.
- `DebugLogger.ts`: A small logging utility, that logs everything to the Debug
  Tab in the UI.
- `Timeline.ts`: The request timeline used for Timeline tab in the UI.
- `Timings.ts`: Logger for timings shown in the debug tab.

## Code flow

This is a high level overview of what happens inside most functions during the
request and the order they are called.

### Pre-request

- `collectFolderData.ts` Collects all folder data, like folder headers and
  scripts.
- `applyCollectionSettings.ts` merges headers and auth from collection settings
  and folders to the request. Also applies the global proxy settings to the
  brunoConfig.
- `preRequestVars.ts` Evaluates the request variables and saves them the the
  context. Uses the `vars-runtime.ts` for evaluation.
- `preRequestScripts.ts` Executes the pre request script. Concatenates the
  collection, folder and request script together. And executes it with the
  `script-runner.ts`.
- `interpolateRequest.ts` Goes over every value in the request and interpolates
  the placeholder. All changes are logged in the DebugLogger.
- `createHttpRequest.ts` Uses the `RequestItem` to create a new request object
  that can be passed into `node:http(s)`. Here the body is converted, some
  default headers are created and a ProxyAgent is created, if configured.

### HttpRequest

- `requestHandler.ts` starts a loop for the request that ends when the final
  response is reached. In the beginning some mandatory headers are created like
  `host` and `cookies`. If the AwsV4 Auth is active, the required headers for it
  are added in `awsSig4vAuth.ts`.
- The request itself is then executed in `httpRequest.ts`. `collectSslInfo.ts`
  is used to collect information about the Server SSL certificate to display it
  the timeline.
- `handleServerResponse` will decode the response body using
  `decodeResponseBody.ts` if it is decoded with like GZIP. Digest auth is
  handled with `digestAuth.ts` and any other redirects are also handled. The
  handler will write its final decision into `response.info`.

### Post-Request

- `postRequestVars.ts` Evaluate all post request variables from request, folders
  and collection.
- `postRequestScript.ts` Concatenates all scripts from request, folders and
  collection. The order is based on the value in `scripts.flow`, default
  "sandwich". Uses `script-runner.ts` for the script execution.
- `assertions.ts` Executes all assertions, defined in request, folders and the
  collection. Uses `assert-runtime.ts` to do the assertions.
- `tests.ts` Like the post request script, but exposes also test functions to
  the script.
