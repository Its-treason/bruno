import { RequestContext } from '../types';
import { runScript } from '../runtime/script-runner';
import { EOL } from 'node:os';
import { FolderData } from '../preRequest/collectFolderData';

export async function postRequestScript(context: RequestContext, folderData: FolderData[]) {
  const collectionPostRequestScript = context.collection.root?.request?.script?.res ?? '';
  const folderLevelScripts = folderData.map((data) => data.postReqScript).filter(Boolean);
  const requestPostRequestScript = context.requestItem.request.script.res ?? '';

  const postRequestScript =
    context.collection.brunoConfig.scripts?.flow === 'sequential'
      ? [collectionPostRequestScript, ...folderLevelScripts, requestPostRequestScript].join(EOL)
      : [requestPostRequestScript, ...folderLevelScripts.reverse(), collectionPostRequestScript].join(EOL);

  if (postRequestScript.replaceAll('\n', '').trim().length === 0) {
    return;
  }

  context.debug.log('Post request script', postRequestScript);
  context.timings.startMeasure('postScript');

  let scriptResult;

  try {
    scriptResult = await runScript(
      postRequestScript,
      context.requestItem,
      context.response!,
      context.responseBody,
      context.runner,
      context.variables,
      context.environmentName,
      false,
      context.collection.pathname,
      context.executionMode,
      context.collection.brunoConfig.scripts,
      (type: string, payload: any) => context.callback.consoleLog(type, payload)
    );
  } catch (error) {
    context.debug.log('Post request script error', { error });

    throw error;
  } finally {
    context.timings.stopMeasure('postScript');
  }

  context.callback.updateScriptEnvironment(context);

  context.debug.log('Post request script finished', {
    ...scriptResult,
    responseBody: undefined
  });

  if (context.responseBody !== scriptResult.responseBody) {
    context.debug.log('Response body was overwritten');
    context.responseBody = scriptResult.responseBody;
  }
}
