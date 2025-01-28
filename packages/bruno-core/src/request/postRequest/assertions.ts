import { AssertRuntime } from '../runtime/assert-runtime';
import { RequestContext } from '../types';

export function assertions(context: RequestContext) {
  const assertions = context.requestItem.request.assertions;
  if (!assertions) {
    context.callback.assertionResults(context, []);
    return;
  }

  const assertRuntime = new AssertRuntime();
  const results = assertRuntime.runAssertions(
    assertions,
    context.requestItem,
    context.response,
    context,
    context.responseBody,
    context.variables,
    context.executionMode
  );

  context.callback.assertionResults(context, results);
}
