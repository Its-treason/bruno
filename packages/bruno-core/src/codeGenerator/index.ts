import { nanoid } from 'nanoid';
import { CookieJar } from 'tough-cookie';
import { Collection, CollectionEnvironment, Preferences, RequestContext, RequestItem } from '../request/types';
import { Callbacks } from '../request/dataObject/Callbacks';
import { DebugLogger } from '../request/dataObject/DebugLogger';
import { Timings } from '../request/dataObject/Timings';
import { applyCollectionSettings } from '../request/preRequest/applyCollectionSettings';
import { interpolateRequest } from '../request/preRequest/interpolateRequest';
import { preRequestScript } from '../request/preRequest/preRequestScript';
import { collectFolderData } from '../request/preRequest/collectFolderData';
import { HTTPSnippet } from '@readme/httpsnippet';
import { createHar } from './createHar';
import { VariablesContext } from '../request/dataObject/VariablesContext';
import { RunnerContext } from '../request/dataObject/RunnerContext';

type GenerateCodeOptions = {
  targetId: string;
  clientId: string;
  executeScript: boolean;
};

export async function generateCode(
  requestItem: RequestItem,
  collection: Collection,
  preferences: Preferences,
  cookieJar: CookieJar,
  options: GenerateCodeOptions,
  fetchAuthorizationCode: Callbacks['fetchAuthorizationCode'],
  environment?: CollectionEnvironment,
  globalVariables: Record<string, unknown> = {}
) {
  if (requestItem.draft) {
    requestItem.request = requestItem.draft.request;
  }

  const variables = new VariablesContext(collection, requestItem, globalVariables, environment);

  const context: RequestContext = {
    uid: nanoid(),
    dataDir: '', // Not used here
    brunoVersion: '', // Not used here
    cancelToken: '', // Not used here
    delay: 0, // Not used here
    abortController: new AbortController(),

    executionMode: 'standalone',

    requestItem,
    collection,
    preferences,
    cookieJar,
    variables,
    runner: new RunnerContext(),

    callback: new Callbacks({}, fetchAuthorizationCode),
    timings: new Timings(),
    debug: new DebugLogger()
  };

  return await doGenerateCode(context, options);
}

async function doGenerateCode(context: RequestContext, options: GenerateCodeOptions): Promise<string> {
  context.debug.addStage('Generate code');

  const [folderData, folderVariables] = collectFolderData(context.collection, context.requestItem.uid);
  context.variables.setFolderVariables(folderVariables);

  // Folder Headers are also applied here
  applyCollectionSettings(context, folderData);
  if (options.executeScript) {
    await preRequestScript(context, folderData);
  }
  interpolateRequest(context);

  if (options.targetId === 'url-only') {
    return context.requestItem.request.url;
  }

  const harRequest = await createHar(context);
  const code = new HTTPSnippet(harRequest).convert(options.targetId as any, options.clientId);
  if (code) {
    return code[0];
  }
  throw new Error('Code generation failed! Nothing was generated');
}
