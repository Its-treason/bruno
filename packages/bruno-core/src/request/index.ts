import { DebugLogger } from './dataObject/DebugLogger';
import { Timings } from './dataObject/Timings';
import { Collection, CollectionEnvironment, Preferences, RequestContext, RequestItem } from './types';
import { preRequestScript } from './preRequest/preRequestScript';
import { applyCollectionSettings } from './preRequest/applyCollectionSettings';
import { createHttpRequest } from './preRequest/createHttpRequest';
import { postRequestVars } from './postRequest/postRequestVars';
import { postRequestScript } from './postRequest/postRequestScript';
import { assertions } from './postRequest/assertions';
import { tests } from './postRequest/tests';
import { interpolateRequest } from './preRequest/interpolateRequest';
import { Callbacks, RawCallbacks } from './dataObject/Callbacks';
import { makeHttpRequest } from './httpRequest/requestHandler';
import { CookieJar } from 'tough-cookie';
import { readResponseBodyAsync } from './runtime/utils';
import { collectFolderData } from './preRequest/collectFolderData';
import { applyOAuth2 } from './preRequest/OAuth2/applyOAuth2';
import { determinePreviewType } from './preRequest/determinePreviewMode';
import { randomUUID } from 'crypto';
import { VariablesContext } from './dataObject/VariablesContext';

export async function request(
  requestItem: RequestItem,
  collection: Collection,
  globalVariables: Record<string, unknown>,
  preferences: Preferences,
  cookieJar: CookieJar,
  dataDir: string,
  cancelToken: string,
  abortController: AbortController,
  brunoVersion: string,
  executionMode: 'standalone' | 'runner',
  fetchAuthorizationCode: Callbacks['fetchAuthorizationCode'],
  environment?: CollectionEnvironment,
  rawCallbacks: Partial<RawCallbacks> = {},
  delay: number = 0
) {
  if (requestItem.draft) {
    requestItem.request = requestItem.draft.request;
  }

  const context: RequestContext = {
    uid: randomUUID(),
    dataDir,
    cancelToken,
    abortController,
    brunoVersion,
    environmentName: environment?.name,
    executionMode,
    delay,

    requestItem,
    collection,
    preferences,
    cookieJar,
    variables: new VariablesContext(collection, requestItem, globalVariables, environment),

    callback: new Callbacks(rawCallbacks, fetchAuthorizationCode),
    timings: new Timings(),
    debug: new DebugLogger()
  };

  try {
    return await doRequest(context);
  } catch (error) {
    context.error = error instanceof Error ? error : new Error(String(error));
    context.callback.responseError(context, context.error.message);
  } finally {
    context.timings.stopAll();
  }

  return context;
}

async function doRequest(context: RequestContext): Promise<RequestContext> {
  context.timings.startMeasure('total');
  context.debug.addStage('Pre-Request');

  context.callback.requestQueued(context);
  context.callback.folderRequestAdded(context);

  // This will only be used for the request runner
  if (context.delay > 0) {
    context.callback.requestDelayed(context);

    await new Promise<void>((resolve) => {
      context.abortController?.signal.addEventListener('abort', () => resolve());
      setTimeout(() => resolve(), context.delay);
    });
  }

  const [folderData, folderVariables] = collectFolderData(context.collection, context.requestItem.uid);
  context.variables.setFolderVariables(folderVariables);

  // Folder Headers are also applied here
  applyCollectionSettings(context, folderData);
  await preRequestScript(context, folderData);
  interpolateRequest(context);
  if (context.requestItem.request.auth.mode === 'oauth2') {
    await applyOAuth2(context);
  }
  await createHttpRequest(context);

  context.callback.requestSend(context);

  context.debug.addStage('Request');
  context.timings.startMeasure('request');
  await makeHttpRequest(context);
  context.timings.stopMeasure('request');

  context.debug.addStage('Post-Request');
  context.callback.cookieUpdated(context.cookieJar);

  context.timings.startMeasure('parseResponse');
  context.responseBody = await readResponseBodyAsync(context.response!.path);
  context.timings.stopMeasure('parseResponse');

  determinePreviewType(context);
  context.callback.responseReceived(context);

  postRequestVars(context, folderData);
  await postRequestScript(context, folderData);
  assertions(context);
  await tests(context, folderData);

  context.timings.stopMeasure('total');

  return context;
}
