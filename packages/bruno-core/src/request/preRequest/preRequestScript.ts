import { RequestContext } from '../types';
import { runScript } from '../runtime/script-runner';
import os from 'node:os';
import { FolderData } from './collectFolderData';

export async function preRequestScript(context: RequestContext, folderData: FolderData[]) {
  const collectionPreRequestScript = context.collection.root?.request?.script?.req ?? '';
  const folderLevelScripts = folderData.map((data) => data.preReqScript).filter(Boolean);
  const requestPreRequestScript = context.requestItem.request.script.req ?? '';
  const preRequestScript = [collectionPreRequestScript, ...folderLevelScripts, requestPreRequestScript].join(os.EOL);

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
      context.variables,
      context.environmentName,
      false,
      context.collection.pathname,
      context.collection.brunoConfig.scripts,
      (type: string, payload: any) => context.callback.consoleLog(type, payload)
    );
  } catch (error) {
    context.debug.log('Pre request script error', { error });

    throw error;
  } finally {
    context.timings.stopMeasure('preScript');
  }

  context.callback.updateScriptEnvironment(context, scriptResult.envVariables, scriptResult.runtimeVariables);

  context.debug.log('Pre request script finished', scriptResult);

  context.nextRequestName = scriptResult.nextRequestName;
  // The script will use `cleanJson` to remove any weird things before sending to the mainWindow
  // This destroys the references, so we update variables here manually
  context.variables.collection = scriptResult.runtimeVariables;
  context.variables.environment = scriptResult.envVariables;
}
