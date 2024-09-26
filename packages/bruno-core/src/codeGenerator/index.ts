import { nanoid } from 'nanoid';
import { CookieJar } from 'tough-cookie';
import { Collection, CollectionEnvironment, Preferences, RequestContext, RequestItem } from '../request/types';
import { Callbacks } from '../request/Callbacks';
import { DebugLogger } from '../request/DebugLogger';
import { Timings } from '../request/Timings';
import { applyCollectionSettings } from '../request/preRequest/applyCollectionSettings';
import { interpolateRequest } from '../request/preRequest/interpolateRequest';
import { preRequestScript } from '../request/preRequest/preRequestScript';
import { collectFolderData } from '../request/preRequest/collectFolderData';
import { HTTPSnippet } from '@readme/httpsnippet';
import { createHar } from './createHar';

type GenerateCodeOptions = {
  targetId: string;
  clientId: string;
};

export async function generateCode(
  requestItem: RequestItem,
  collection: Collection,
  preferences: Preferences,
  cookieJar: CookieJar,
  options: GenerateCodeOptions,
  environment?: CollectionEnvironment
) {
  // Convert the EnvVariables into a Record
  const environmentVariableRecord = (environment?.variables ?? []).reduce<Record<string, unknown>>((acc, env) => {
    if (env.enabled) {
      acc[env.name] = env.value;
    }
    return acc;
  }, {});

  const collectionVariables = (collection.root?.request?.vars?.req || []).reduce((acc, variable) => {
    if (variable.enabled) {
      acc[variable.name] = variable.value;
    }
    return acc;
  }, {} as Record<string, unknown>);

  const requestVariables = (requestItem.request?.vars?.req || []).reduce((acc, variable) => {
    if (variable.enabled) {
      acc[variable.name] = variable.value;
    }
    return acc;
  }, {} as Record<string, unknown>);

  const context: RequestContext = {
    uid: nanoid(),

    executionMode: 'standalone',

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
      collection: collectionVariables,
      request: requestVariables,
      runtime: collection.runtimeVariables
    },

    callback: new Callbacks({}),
    timings: new Timings(),
    debug: new DebugLogger()
  };

  return await doGenerateCode(context, options);
}

async function doGenerateCode(context: RequestContext, options: GenerateCodeOptions): Promise<string> {
  context.debug.addStage('Generate code');

  const [folderData, folderVariables] = collectFolderData(context.collection, context.requestItem.uid);
  context.variables.folder = folderVariables;

  // Folder Headers are also applied here
  applyCollectionSettings(context, folderData);
  await preRequestScript(context, folderData);
  interpolateRequest(context);

  const harRequest = await createHar(context);
  const code = new HTTPSnippet(harRequest).convert(options.targetId as any, options.clientId);
  if (code) {
    return code[0];
  }
  throw new Error('Code generation failed! Nothing was generated');
}
