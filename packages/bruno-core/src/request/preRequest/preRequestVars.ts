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
    context.debug.log('No request variables');
    return;
  }

  const varsRuntime = new VarsRuntime();
  context.variables.request = varsRuntime.runPreRequestVars(
    preRequestVars,
    context.requestItem,
    context.variables.environment,
    context.variables.collection,
    context.variables.process,
    context.collection.pathname,
    context.environmentName
  );

  context.debug.log('Request variables', context.variables.request);
}
