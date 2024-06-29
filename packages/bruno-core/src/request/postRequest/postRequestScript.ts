import { RequestContext } from '../types';
import { runScript } from '../runtime/script-runner';
import { EOL } from 'node:os';

export async function postRequestScript(context: RequestContext, responseBody: any) {
  const collectionPostRequestScript = context.collection.root?.request?.script?.res ?? '';
  const requestPostRequestScript = context.requestItem.request.script.res ?? '';
  const postRequestScript = collectionPostRequestScript + EOL + requestPostRequestScript;

  context.debug.log('Post request script', {
    collectionPostRequestScript,
    requestPostRequestScript,
    postRequestScript
  });
  context.timings.startMeasure('postScript');

  let scriptResult;
  try {
    scriptResult = await runScript(
      postRequestScript,
      context.requestItem,
      context.response!,
      responseBody,
      context.variables,
      false,
      context.collection.pathname,
      context.collection.brunoConfig.scripts,
      (type: string, payload: any) => context.callback.consoleLog(type, payload)
    );
  } catch (error) {
    context.debug.log('Post request script error', { error });

    throw error;
  } finally {
    context.timings.stopMeasure('postScript');
  }

  context.callback.updateScriptEnvironment(context, scriptResult.envVariables, scriptResult.collectionVariables);

  context.debug.log('Post request script finished', scriptResult);

  context.nextRequestName = scriptResult.nextRequestName;
  // The script will use `cleanJson` to remove any weird things before sending to the mainWindow
  // This destroys the references, so we update variables here manually
  context.variables.collection = scriptResult.collectionVariables;
  context.variables.environment = scriptResult.envVariables;
}
