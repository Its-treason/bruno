export abstract class AbstractSecretStore {
  private static instance?: AbstractSecretStore;
  public static init(instance: AbstractSecretStore): void {
    if (AbstractSecretStore.instance) {
      throw new Error('init has already been called!');
    }
    this.instance = instance;
  }

  public static getInstance(): AbstractSecretStore {
    if (!AbstractSecretStore.instance) {
      throw new Error('Call ItemIdStore.init first');
    }
    return AbstractSecretStore.instance;
  }

  public abstract getSecret(collectionPath: string, environmentName: string, name: string): string;
}
