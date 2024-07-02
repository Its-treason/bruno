import { RequestContext } from '../types';
import { VarsRuntime } from '../runtime/vars-runtime';
import { FolderData } from './collectFolderData';

export function preRequestVars(context: RequestContext, folderData: FolderData[]) {
  const preRequestVars = context.requestItem.request.vars.req ?? [];
  for (const folder of folderData) {
    // Execute folder vars before request vars
    preRequestVars.unshift(...(folder.preReqVariables ?? []));
  }

  if (preRequestVars.length === 0) {
    context.debug.log('Pre request variables skipped');
    return;
  }

  const before = structuredClone(context.variables.collection);

  const varsRuntime = new VarsRuntime();
  // This will update context.variables.collection by reference inside the 'Bru' class
  const varsResult = varsRuntime.runPreRequestVars(
    preRequestVars,
    context.requestItem,
    context.variables.environment,
    context.variables.collection,
    context.collection.pathname,
    context.variables.process
  );

  if (varsResult) {
    context.callback.updateScriptEnvironment(context, undefined, varsResult.collectionVariables);
  }

  context.debug.log('Pre request variables evaluated', { before, after: context.variables.collection });
}
