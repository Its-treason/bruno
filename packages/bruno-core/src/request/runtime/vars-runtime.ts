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
    variables: RequestContext['variables'],
    collectionPath: string,
    executionMode: string,
    environmentName?: string
  ) {
    const enabledVars = _.filter(vars, (v) => v.enabled);
    if (!enabledVars.length) {
      return;
    }

    const bru = new Bru(
      variables.environment,
      variables.runtime,
      variables.request,
      variables.folder,
      variables.collection,
      variables.process,
      collectionPath,
      environmentName
    );
    const req = new BrunoRequest(request, true, executionMode);
    const res = createResponseParser(response, responseBody);

    const context = {
      ...variables.collection,
      ...variables.environment,
      ...variables.folder,
      ...variables.request,
      ...variables.runtime,
      ...variables.process,
      bru,
      req,
      res
    };

    _.each(enabledVars, (postRequestVar) => {
      const value = evaluateJsExpression(postRequestVar.value, context);
      // This will update the runtimeVariables
      bru.setVar(postRequestVar.name, value);
    });

    return {
      runtimeVariables: bru.runtimeVariables
    };
  }
}
