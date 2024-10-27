import { interpolate } from '@usebruno/common';

const variableNameRegex = /^[\w-.]*$/;

export class Bru {
  _nextRequest?: string;

  constructor(
    public envVariables: any,
    public runtimeVariables: any,
    public requestVariables: Record<string, unknown>,
    public folderVariables: Record<string, unknown>,
    public collectionVariables: Record<string, unknown>,
    public globalVariables: Record<string, unknown>,
    public processEnvVars: any,
    private collectionPath: string,
    private environmentName?: string
  ) {}

  interpolate(target: unknown): string | unknown {
    return interpolate(target, {
      ...this.globalVariables,
      ...this.collectionVariables,
      ...this.envVariables,
      ...this.folderVariables,
      ...this.requestVariables,
      ...this.runtimeVariables,
      ...this.processEnvVars
    });
  }

  cwd() {
    return this.collectionPath;
  }

  getEnvName() {
    return this.environmentName;
  }

  getProcessEnv(key: string): unknown {
    return this.processEnvVars[key];
  }

  hasEnvVar(key: string) {
    return Object.hasOwn(this.envVariables, key);
  }

  getEnvVar(key: string) {
    return interpolate(this.envVariables[key], this.processEnvVars);
  }

  setEnvVar(key: string, value: unknown) {
    if (!key) {
      throw new Error('Creating a env variable without specifying a name is not allowed.');
    }

    this.envVariables[key] = value;
  }

  getGlobalEnvVar(key: string) {
    return this.interpolate(this.globalVariables[key]);
  }

  setGlobalEnvVar(key: string, value: unknown) {
    if (!key) {
      throw new Error('Creating a env variable without specifying a name is not allowed.');
    }
    this.globalVariables[key] = value;
  }

  hasVar(key: string) {
    return Object.hasOwn(this.runtimeVariables, key);
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

    this.runtimeVariables[key] = value;
  }

  getVar(key: string): unknown {
    if (!variableNameRegex.test(key)) {
      throw new Error(
        `Variable name: "${key}" contains invalid characters!` +
          ' Names must only contain alpha-numeric characters, "-", "_", "."'
      );
    }

    return this.interpolate(this.runtimeVariables[key]);
  }

  deleteVar(key: string) {
    delete this.runtimeVariables[key];
  }

  getCollectionVar(key: string) {
    if (!this.collectionVariables[key]) {
      return undefined;
    }
    return this.interpolate(this.collectionVariables[key]);
  }

  getFolderVar(key: string) {
    if (!this.folderVariables[key]) {
      return undefined;
    }
    return this.interpolate(this.folderVariables[key]);
  }

  getRequestVar(key: string): unknown {
    return this.interpolate(this.requestVariables[key] as string);
  }

  setNextRequest(nextRequest: string) {
    this._nextRequest = nextRequest;
  }

  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), ms));
  }
}
