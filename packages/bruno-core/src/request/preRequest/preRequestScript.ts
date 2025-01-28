import { RequestContext } from '../types';
import { runScript } from '../runtime/script-runner';
import os from 'node:os';
import { FolderData } from './collectFolderData';

export async function preRequestScript(context: RequestContext, folderData: FolderData[]) {
  const collectionPreRequestScript = context.collection.root?.request?.script?.req ?? '';
  const folderLevelScripts = folderData.map((data) => data.preReqScript).filter(Boolean);
  const requestPreRequestScript = context.requestItem.request.script.req ?? '';
  const preRequestScript = [collectionPreRequestScript, ...folderLevelScripts, requestPreRequestScript].join(os.EOL);

  if (preRequestScript.replaceAll('\n', '').trim().length === 0) {
    return;
  }

  context.debug.log('Pre request script', {
    preRequestScript
  });
  context.timings.startMeasure('preScript');

  let scriptResult;
  try {
    scriptResult = await runScript(
      preRequestScript,
      context.requestItem,
      null,
      null,
      context,
      false,
      context.collection.pathname,
      context.executionMode,
      context.collection.brunoConfig.scripts,
      (type: string, payload: any) => context.callback.consoleLog(type, payload)
    );
  } catch (error) {
    context.debug.log('Pre request script error', { error });

    throw error;
  } finally {
    context.timings.stopMeasure('preScript');
  }

  context.callback.updateScriptEnvironment(context);

  context.debug.log('Pre request script finished', scriptResult);
}
