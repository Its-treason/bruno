import _ from 'lodash';
import { Bru } from './dataObject/Bru';
import { BrunoRequest } from './dataObject/BrunoRequest';
import { evaluateJsExpression, createResponseParser } from './utils';
import { RequestContext, RequestItem, RequestVariable, Response } from '../types';

export class VarsRuntime {
  runPostResponseVars(
    vars: RequestVariable[],
    request: RequestItem,
    response: Response,
    responseBody: any,
    requestContext: RequestContext,
    executionMode: string
  ) {
    const enabledVars = _.filter(vars, (v) => v.enabled);
    if (!enabledVars.length) {
      return;
    }

    const bru = new Bru(requestContext);
    const req = new BrunoRequest(request, true, executionMode);
    const res = createResponseParser(response, responseBody);

    const context = {
      ...requestContext.variables.merge(),
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
