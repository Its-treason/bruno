import _ from 'lodash';
import { Bru } from './dataObject/Bru';
import { BrunoRequest } from './dataObject/BrunoRequest';
import { evaluateJsTemplateLiteral, evaluateJsExpression, createResponseParser } from './utils';
import { RequestItem, RequestVariable, Response } from '../types';

export class VarsRuntime {
  runPreRequestVars(
    vars: RequestVariable[],
    request: RequestItem,
    envVariables: Record<string, unknown>,
    collectionVariables: Record<string, unknown>,
    processEnvVars: Record<string, unknown>,
    collectionPath: string,
    environmentName?: string
  ) {
    const enabledVars = _.filter(vars, (v) => v.enabled);
    if (!enabledVars.length) {
      return {};
    }

    const bru = new Bru(envVariables, collectionVariables, {}, processEnvVars, collectionPath, environmentName);
    const req = new BrunoRequest(request, true);

    const combinedVariables = {
      ...envVariables,
      ...collectionVariables,
      ...processEnvVars,
      bru,
      req
    };

    const requestVariables: Record<string, unknown> = {};
    _.each(enabledVars, (preReqVar) => {
      const value = evaluateJsTemplateLiteral(preReqVar.value, combinedVariables);
      requestVariables[preReqVar.name] = value;
    });

    return requestVariables;
  }

  runPostResponseVars(
    vars: RequestVariable[],
    request: RequestItem,
    response: Response,
    responseBody: any,
    envVariables: Record<string, unknown>,
    collectionVariables: Record<string, unknown>,
    requestVariables: Record<string, unknown>,
    processEnvVars: Record<string, unknown>,
    collectionPath: string,
    environmentName?: string
  ) {
    const enabledVars = _.filter(vars, (v) => v.enabled);
    if (!enabledVars.length) {
      return;
    }

    const bru = new Bru(
      envVariables,
      collectionVariables,
      requestVariables,
      processEnvVars,
      collectionPath,
      environmentName
    );
    const req = new BrunoRequest(request, true);
    const res = createResponseParser(response, responseBody);

    const context = {
      ...envVariables,
      ...collectionVariables,
      ...requestVariables,
      ...processEnvVars,
      bru,
      req,
      res
    };

    _.each(enabledVars, (v) => {
      const value = evaluateJsExpression(v.value, context);
      bru.setVar(v.name, value);
    });

    return {
      collectionVariables
    };
  }
}
