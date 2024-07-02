import { RequestContext } from '../types';
import { EOL } from 'node:os';
import { runScript } from '../runtime/script-runner';
import { FolderData } from '../preRequest/collectFolderData';

export async function tests(context: RequestContext, folderData: FolderData[], responseBody: any) {
  const collectionPostRequestScript = context.collection.root?.request?.tests ?? '';
  const folderLevelTests = folderData.map((data) => data.testScript).filter(Boolean);
  const requestPostRequestScript = context.requestItem.request.tests ?? '';
  const postRequestScript = [requestPostRequestScript, ...folderLevelTests.reverse(), collectionPostRequestScript].join(
    EOL
  );

  context.debug.log('Test script', {
    postRequestScript
  });
  context.timings.startMeasure('test');

  let scriptResult;
  try {
    scriptResult = await runScript(
      postRequestScript,
      context.requestItem,
      context.response!,
      responseBody,
      context.variables,
      true,
      context.collection.pathname,
      context.collection.brunoConfig.scripts,
      (type: string, payload: any) => context.callback.consoleLog(type, payload)
    );
  } catch (error) {
    context.debug.log('Test script error', { error });

    throw error;
  } finally {
    context.timings.stopMeasure('test');
  }

  context.callback.testResults(context, scriptResult.results);
  context.callback.folderTestResults(context, scriptResult.results);
  context.callback.updateScriptEnvironment(context, scriptResult.envVariables, scriptResult.collectionVariables);

  context.debug.log('Test script finished', scriptResult);
}
