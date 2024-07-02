import { DebugLogger } from './DebugLogger';
import { Timings } from './Timings';
import { Collection, CollectionEnvironment, Preferences, RequestContext, RequestItem } from './types';
import { preRequestVars } from './preRequest/preRequestVars';
import { preRequestScript } from './preRequest/preRequestScript';
import { applyCollectionSettings } from './preRequest/applyCollectionSettings';
import { createHttpRequest } from './preRequest/createHttpRequest';
import { postRequestVars } from './postRequest/postRequestVars';
import { postRequestScript } from './postRequest/postRequestScript';
import { assertions } from './postRequest/assertions';
import { tests } from './postRequest/tests';
import { interpolateRequest } from './preRequest/interpolateRequest';
import { Callbacks, RawCallbacks } from './Callbacks';
import { nanoid } from 'nanoid';
import { join } from 'node:path';
import { rm } from 'node:fs/promises';
import { makeHttpRequest } from './httpRequest/requestHandler';
import { CookieJar } from 'tough-cookie';
import { readResponseBodyAsync } from './runtime/utils';
import { collectFolderData } from './preRequest/collectFolderData';

export async function request(
  requestItem: RequestItem,
  collection: Collection,
  preferences: Preferences,
  cookieJar: CookieJar,
  dataDir: string,
  cancelToken: string,
  abortController: AbortController,
  environment?: CollectionEnvironment,
  rawCallbacks: Partial<RawCallbacks> = {}
) {
  // Convert the EnvVariables into a Record
  const environmentVariableRecord = (environment?.variables ?? []).reduce<Record<string, unknown>>((acc, env) => {
    if (env.enabled) {
      acc[env.name] = env.value;
    }
    return acc;
  }, {});

  const context: RequestContext = {
    uid: nanoid(),
    dataDir,
    cancelToken,
    abortController,

    requestItem,
    collection,
    preferences,
    cookieJar,
    variables: {
      process: {
        process: {
          // @ts-ignore
          env: process.env
        }
      },
      environment: environmentVariableRecord,
      collection: collection.collectionVariables
    },

    callback: new Callbacks(rawCallbacks),
    timings: new Timings(),
    debug: new DebugLogger()
  };

  const targetPath = join(context.dataDir, context.requestItem.uid);
  await rm(targetPath, { force: true });

  try {
    return await doRequest(context);
  } catch (error) {
    context.error = error instanceof Error ? error : new Error(String(error));
  } finally {
    context.timings.stopAll();
  }

  return context;
}

async function doRequest(context: RequestContext): Promise<RequestContext> {
  context.timings.startMeasure('total');
  context.debug.addStage('Pre-Request');

  context.callback.requestQueued(context);
  context.callback.folderRequestQueued(context);

  const folderData = collectFolderData(context.collection, context.requestItem.uid);
  // Folder Headers are also applied here
  applyCollectionSettings(context, folderData);
  preRequestVars(context, folderData);
  await preRequestScript(context, folderData);
  interpolateRequest(context);
  await createHttpRequest(context);

  context.callback.requestSend(context);

  context.debug.addStage('Request');
  context.timings.startMeasure('request');
  await makeHttpRequest(context);
  context.timings.stopMeasure('request');

  context.debug.addStage('Post-Request');
  context.callback.cookieUpdated(context.cookieJar);

  const body = await readResponseBodyAsync(context.response!.path);

  postRequestVars(context, folderData, body);
  await postRequestScript(context, folderData, body);
  assertions(context, body);
  await tests(context, folderData, body);

  context.timings.stopMeasure('total');

  context.callback.folderResponseReceived(context);

  return context;
}
