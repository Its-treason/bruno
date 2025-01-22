import { interpolate } from '@usebruno/common';
import { VariablesContext } from '../../dataObject/VariablesContext';
import { Runner } from './Runner';

const variableNameRegex = /^[\w-.]*$/;

export class Bru {
  constructor(
    public runner: Runner,
    private variables: VariablesContext,
    private collectionPath: string,
    private environmentName?: string
  ) {}

  interpolate(target: unknown): string | unknown {
    return interpolate(target, this.variables.merge());
  }

  cwd() {
    return this.collectionPath;
  }

  getEnvName() {
    return this.environmentName;
  }

  getProcessEnv(key: string): unknown {
    return this.variables.getProcessEnvVariables().process.env[key];
  }

  hasEnvVar(key: string) {
    return Object.hasOwn(this.variables.getEnvironmentVariables(), key);
  }

  getEnvVar(key: string) {
    return interpolate(this.variables.getEnvironmentVariables()[key]);
  }

  setEnvVar(key: string, value: unknown) {
    if (!key) {
      throw new Error('Creating a env variable without specifying a name is not allowed.');
    }

    this.variables.setEnvironmentVariable(key, value);
  }

  getGlobalEnvVar(key: string) {
    return this.interpolate(this.variables.getGlobalVariables()[key]);
  }

  setGlobalEnvVar(key: string, value: unknown) {
    if (!key) {
      throw new Error('Creating a env variable without specifying a name is not allowed.');
    }
    this.variables.setGlobalVariable(key, value);
  }

  hasVar(key: string) {
    return Object.hasOwn(this.variables.getRuntimeVariables(), key);
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

    this.variables.setRuntimeVariable(key, value);
  }

  getVar(key: string): unknown {
    if (!variableNameRegex.test(key)) {
      throw new Error(
        `Variable name: "${key}" contains invalid characters!` +
          ' Names must only contain alpha-numeric characters, "-", "_", "."'
      );
    }

    return this.interpolate(this.variables.getRuntimeVariables()[key]);
  }

  deleteVar(key: string) {
    delete this.variables.getRuntimeVariables()[key];
  }

  getCollectionVar(key: string) {
    const variables = this.variables.getCollectionVariables();
    if (!variables[key]) {
      return undefined;
    }
    return this.interpolate(variables[key]);
  }

  getFolderVar(key: string) {
    const variables = this.variables.getFolderVariables();
    if (!variables[key]) {
      return undefined;
    }
    return this.interpolate(variables[key]);
  }

  getRequestVar(key: string): unknown {
    return this.interpolate(this.variables.getRequestVariables()[key] as string);
  }

  setNextRequest(nextRequest: string) {
    this.runner.setNextRequest(nextRequest);
  }

  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), ms));
  }

  visualize(): void {
    // TODO: Implemtation needed
  }
}
