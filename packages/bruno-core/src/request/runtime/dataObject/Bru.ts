import { interpolate } from '@usebruno/common';
import { RequestContext } from '../../types';
import path from 'node:path';
import { findInItems } from '../utils';
import { request } from '../..';
import { Timeline } from '../../dataObject/Timeline';
import { STATUS_CODES } from 'node:http';
import { RunnerContext } from '../../dataObject/RunnerContext';
import { Runner } from './Runner';

const variableNameRegex = /^[\w-.]*$/;
const ctx = Symbol('internalContext');

export class Bru {
  private [ctx]: RequestContext;
  public runner: Runner;

  constructor(context: RequestContext) {
    this[ctx] = context;
    this.runner = new Runner(context.runner);
  }

  interpolate(target: unknown): string | unknown {
    return interpolate(target, this[ctx].variables.merge());
  }

  cwd() {
    return this[ctx].collection.pathname;
  }

  getCollectionName(): string {
    return this[ctx].collection.name;
  }

  getEnvName() {
    return this[ctx].environmentName;
  }

  getProcessEnv(key: string): unknown {
    return this[ctx].variables.getProcessEnvVariables().process.env[key];
  }

  hasEnvVar(key: string) {
    return Object.hasOwn(this[ctx].variables.getEnvironmentVariables(), key);
  }

  getEnvVar(key: string) {
    return interpolate(this[ctx].variables.getEnvironmentVariables()[key]);
  }

  setEnvVar(key: string, value: unknown) {
    if (!key) {
      throw new Error('Creating a env variable without specifying a name is not allowed.');
    }

    this[ctx].variables.setEnvironmentVariable(key, value);
  }

  getGlobalEnvVar(key: string) {
    return this.interpolate(this[ctx].variables.getGlobalVariables()[key]);
  }

  setGlobalEnvVar(key: string, value: unknown) {
    if (!key) {
      throw new Error('Creating a env variable without specifying a name is not allowed.');
    }
    this[ctx].variables.setGlobalVariable(key, value);
  }

  hasVar(key: string) {
    return Object.hasOwn(this[ctx].variables.getRuntimeVariables(), key);
  }

  setVar(key: string, value: unknown) {
    if (!key) {
      throw new Error('Creating a variable without specifying a name is not allowed.');
    }

    if (!variableNameRegex.test(key)) {
      throw new Error(
        `Variable name: "${key}" contains invalid characters!` +
          ' Names must only contain alpha-numeric characters, "-", "_", "."'
      );
    }

    this[ctx].variables.setRuntimeVariable(key, value);
  }

  getVar(key: string): unknown {
    if (!variableNameRegex.test(key)) {
      throw new Error(
        `Variable name: "${key}" contains invalid characters!` +
          ' Names must only contain alpha-numeric characters, "-", "_", "."'
      );
    }

    return this.interpolate(this[ctx].variables.getRuntimeVariables()[key]);
  }

  deleteVar(key: string) {
    delete this[ctx].variables.getRuntimeVariables()[key];
  }

  getCollectionVar(key: string) {
    const variables = this[ctx].variables.getCollectionVariables();
    if (!variables[key]) {
      return undefined;
    }
    return this.interpolate(variables[key]);
  }

  getFolderVar(key: string) {
    const variables = this[ctx].variables.getFolderVariables();
    if (!variables[key]) {
      return undefined;
    }
    return this.interpolate(variables[key]);
  }

  getRequestVar(key: string): unknown {
    return this.interpolate(this[ctx].variables.getRequestVariables()[key] as string);
  }

  setNextRequest(nextRequest: string) {
    this[ctx].runner.setNextRequest(nextRequest);
  }

  async runRequest(relativePath: string) {
    if (!relativePath.endsWith('.bru')) {
      relativePath = relativePath + '.bru';
    }
    const absolutePath = path.join(this[ctx].collection.pathname, relativePath);

    const item = findInItems(this[ctx].collection.items, absolutePath);
    if (!item) {
      throw new Error(`No request item found for path: "${absolutePath}"`);
    }

    const environment = this[ctx].environmentName
      ? this[ctx].variables.toCollectionEnvironment(this[ctx].environmentName)
      : undefined;

    const context = await request(
      structuredClone(item),
      this[ctx].collection,
      this[ctx].variables.getGlobalVariables(),
      this[ctx].preferences,
      this[ctx].cookieJar,
      this[ctx].dataDir,
      this[ctx].cancelToken,
      this[ctx].abortController,
      this[ctx].brunoVersion,
      this[ctx].executionMode,
      this[ctx].callback.fetchAuthorizationCode,
      environment,
      {},
      0
    );

    this[ctx].variables.setEnvironmentVariables(context.variables.getEnvironmentVariables());
    this[ctx].variables.setGlobalVariables(context.variables.getGlobalVariables());
    this[ctx].variables.setRuntimeVariables(context.variables.getRuntimeVariables());

    this[ctx].timeline = (this[ctx].timeline ?? new Timeline()).merge(context.timeline ?? new Timeline());

    return {
      status: context.response?.statusCode,
      statusText: STATUS_CODES[context.response?.statusCode ?? 0] ?? '',
      headers: context.response?.headers,
      data: context.responseBody,
      size: context.response?.size,
      duration: context.response?.responseTime
    };
  }

  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), ms));
  }

  visualize(): void {
    // TODO: Implemtation needed
  }
}
