import { RequestContext } from '../types';
import { EOL } from 'node:os';
import { runScript } from '../runtime/script-runner';
import { FolderData } from '../preRequest/collectFolderData';

export async function tests(context: RequestContext, folderData: FolderData[]) {
  const collectionPostRequestScript = context.collection.root?.request?.tests ?? '';
  const folderLevelTests = folderData.map((data) => data.testScript).filter(Boolean);
  const requestPostRequestScript = context.requestItem.request.tests ?? '';

  const testScript =
    context.collection.brunoConfig.scripts?.flow === 'sequential'
      ? [collectionPostRequestScript, ...folderLevelTests, requestPostRequestScript].join(EOL)
      : [requestPostRequestScript, ...folderLevelTests.reverse(), collectionPostRequestScript].join(EOL);

  if (testScript.replaceAll('\n', '').trim().length === 0) {
    context.callback.testResults(context, []);
    return;
  }

  context.debug.log('Test script', {
    testScript
  });
  context.timings.startMeasure('test');

  let scriptResult;
  try {
    scriptResult = await runScript(
      testScript,
      context.requestItem,
      context.response!,
      context.responseBody,
      context,
      true,
      context.collection.pathname,
      context.executionMode,
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
  context.callback.updateScriptEnvironment(context);

  context.debug.log('Test script finished', {
    results: scriptResult.results
  });
}
