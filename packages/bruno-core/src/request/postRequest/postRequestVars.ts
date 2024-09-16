import { RequestContext } from '../types';
import { VarsRuntime } from '../runtime/vars-runtime';
import { FolderData } from '../preRequest/collectFolderData';

export function postRequestVars(context: RequestContext, folderData: FolderData[]) {
  const postRequestVars = context.requestItem.request.vars.res ?? [];
  for (const folder of folderData) {
    // Execute folder vars before request vars
    postRequestVars.unshift(...(folder.postReqVariables ?? []));
  }
  postRequestVars.unshift(...(context.collection.root?.request?.vars?.res ?? []));

  if (postRequestVars.length === 0) {
    context.debug.log('Post request variables skipped');
    return;
  }

  const before = structuredClone(context.variables.collection);

  const varsRuntime = new VarsRuntime();
  // This will update context.variables.collection by reference inside the 'Bru' class
  const varsResult = varsRuntime.runPostResponseVars(
    postRequestVars,
    context.requestItem,
    context.response!,
    context.responseBody,
    context.variables,
    context.collection.pathname,
    context.environmentName
  );

  if (varsResult) {
    context.callback.updateScriptEnvironment(context, undefined, varsResult.runtimeVariables);
  }

  context.debug.log('Post request variables evaluated', { before, after: context.variables.collection });
}
