import { nanoid } from 'nanoid';
import { CookieJar } from 'tough-cookie';
import { Collection, CollectionEnvironment, Preferences, RequestContext, RequestItem } from '../request/types';
import { Callbacks } from '../request/Callbacks';
import { DebugLogger } from '../request/DebugLogger';
import { Timings } from '../request/Timings';
import { applyCollectionSettings } from '../request/preRequest/applyCollectionSettings';
import { interpolateRequest } from '../request/preRequest/interpolateRequest';
import { preRequestScript } from '../request/preRequest/preRequestScript';
import { preRequestVars } from '../request/preRequest/preRequestVars';
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

  const context: RequestContext = {
    uid: nanoid(),

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
      collection: collection.runtimeVariables
    },

    callback: new Callbacks({}),
    timings: new Timings(),
    debug: new DebugLogger()
  };

  return await doGenerateCode(context, options);
}

async function doGenerateCode(context: RequestContext, options: GenerateCodeOptions): Promise<string> {
  context.debug.addStage('Generate code');

  const folderData = collectFolderData(context.collection, context.requestItem.uid);
  // Folder Headers are also applied here
  applyCollectionSettings(context, folderData);
  preRequestVars(context, folderData);
  await preRequestScript(context, folderData);
  interpolateRequest(context);

  const harRequest = await createHar(context);
  const code = new HTTPSnippet(harRequest).convert(options.targetId as any, options.clientId);
  if (code) {
    return code[0];
  }
  throw new Error('Code generation failed! Nothing was generated');
}
