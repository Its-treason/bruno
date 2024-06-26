import { AssertRuntime } from '../runtime/assert-runtime';
import { RequestContext } from '../types';

export function assertions(context: RequestContext, responseBody: any) {
  const assertions = context.requestItem.request.assertions;
  if (assertions) {
    const assertRuntime = new AssertRuntime();
    const results = assertRuntime.runAssertions(
      assertions,
      context.requestItem,
      context.response,
      responseBody,
      context.variables.environment,
      context.variables.collection,
      context.collection.pathname
    );

    context.callback.folderAssertionResults(context, results);
    context.callback.assertionResults(context, results);
  }
}
