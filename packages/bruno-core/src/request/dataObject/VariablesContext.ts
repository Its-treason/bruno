import { Collection, CollectionEnvironment, RequestItem } from '../types';

export class VariablesContext {
  private process: Record<string, any>;
  private collection: Record<string, any>;
  private environment: Record<string, any> = {};
  private global: Record<string, any>;
  private folder: Record<string, any> = {};
  private request: Record<string, any>;
  private runtime: Record<string, any>;

  constructor(
    collection: Collection,
    requestItem: RequestItem,
    globalVariables: Record<string, unknown>,
    environment?: CollectionEnvironment
  ) {
    this.process = {
      env: {
        ...process.env,
        ...collection.processEnvVariables
      }
    };

    this.collection = (collection.root?.request?.vars?.req || []).reduce(
      (acc, variable) => {
        if (variable.enabled) {
          acc[variable.name] = variable.value;
        }
        return acc;
      },
      {} as Record<string, unknown>
    );

    if (environment) {
      this.environment = environment.variables.reduce<Record<string, any>>((acc, env) => {
        if (env.enabled) {
          acc[env.name] = env.value;
        }
        return acc;
      }, {});
    }

    this.global = globalVariables;

    this.request = (requestItem.request?.vars?.req || []).reduce(
      (acc, variable) => {
        if (variable.enabled) {
          acc[variable.name] = variable.value;
        }
        return acc;
      },
      {} as Record<string, unknown>
    );

    this.runtime = collection.runtimeVariables;
  }

  // This must only be called once, after collecting folder data
  public setFolderVariables(variables: Record<string, any>) {
    this.folder = variables;
  }

  public getGlobalVariables(): Record<string, any> {
    return this.global;
  }
  public getCollectionVariables(): Record<string, any> {
    return this.collection;
  }
  public getEnvironmentVariables(): Record<string, any> {
    return this.environment;
  }
  public getFolderVariables(): Record<string, any> {
    return this.folder;
  }
  public getRequestVariables(): Record<string, any> {
    return this.request;
  }
  public getRuntimeVariables(): Record<string, any> {
    return this.runtime;
  }
  public getProcessEnvVariables(): Record<string, any> {
    return this.process;
  }

  // Only these three are allowed to be updated at runtime.
  public setRuntimeVariable(key: string, value: any) {
    this.runtime[key] = value;
  }
  public setEnvironmentVariable(key: string, value: any) {
    this.environment[key] = value;
  }
  public setGlobalVariable(key: string, value: any) {
    this.global[key] = value;
  }

  public merge(): Record<string, any> {
    return {
      ...this.global,
      ...this.collection,
      ...this.environment,
      ...this.folder,
      ...this.request,
      ...this.runtime,
      ...this.process
    };
  }
}
