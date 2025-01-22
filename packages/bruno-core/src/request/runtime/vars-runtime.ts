import _ from 'lodash';
import { Bru } from './dataObject/Bru';
import { BrunoRequest } from './dataObject/BrunoRequest';
import { evaluateJsExpression, createResponseParser } from './utils';
import { RequestContext, RequestItem, RequestVariable, Response } from '../types';
import { Runner } from './dataObject/Runner';
import { RunnerContext } from '../dataObject/RunnerContext';

export class VarsRuntime {
  runPostResponseVars(
    vars: RequestVariable[],
    request: RequestItem,
    response: Response,
    responseBody: any,
    runnerContext: RunnerContext,
    variables: RequestContext['variables'],
    collectionPath: string,
    executionMode: string,
    environmentName?: string
  ) {
    const enabledVars = _.filter(vars, (v) => v.enabled);
    if (!enabledVars.length) {
      return;
    }

    const bru = new Bru(new Runner(runnerContext), variables, collectionPath, environmentName);
    const req = new BrunoRequest(request, true, executionMode);
    const res = createResponseParser(response, responseBody);

    const context = {
      ...variables.merge(),
      bru,
      req,
      res
    };

    _.each(enabledVars, (postRequestVar) => {
      const value = evaluateJsExpression(postRequestVar.value, context);
      // This will update the runtimeVariables
      bru.setVar(postRequestVar.name, value);
    });
  }
}
