import { RequestContext } from '../types';
import { EOL } from 'node:os';
import { runScript } from '../runtime/script-runner';
import { FolderData } from '../preRequest/collectFolderData';

export async function tests(context: RequestContext, folderData: FolderData[]) {
  const collectionPostRequestScript = context.collection.root?.request?.tests ?? '';
  const folderLevelTests = folderData.map((data) => data.testScript).filter(Boolean);
  const requestPostRequestScript = context.requestItem.request.tests ?? '';

  const postRequestScript =
    context.collection.brunoConfig.scripts?.flow === 'sequential'
      ? [collectionPostRequestScript, ...folderLevelTests, requestPostRequestScript].join(EOL)
      : [requestPostRequestScript, ...folderLevelTests.reverse(), collectionPostRequestScript].join(EOL);

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
      context.responseBody,
      context.variables,
      context.environmentName,
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

  if (scriptResult.nextRequestName) {
    context.nextRequestName = scriptResult.nextRequestName;
  }

  context.callback.testResults(context, scriptResult.results);
  context.callback.folderTestResults(context, scriptResult.results);
  context.callback.updateScriptEnvironment(
    context,
    scriptResult.envVariables,
    scriptResult.runtimeVariables,
    scriptResult.globalVariables
  );

  context.debug.log('Test script finished', {
    envVariables: scriptResult.envVariables,
    runtimeVariables: scriptResult.runtimeVariables,
    globalVariables: scriptResult.globalVariables,
    results: scriptResult.results
  });
}
