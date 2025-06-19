import { readFileSync, writeFileSync } from 'node:fs';
import { generateId } from '@usebruno/common';

export class ItemIdStore {
  // Pathname -> Id
  private idMap: Map<string, string> = new Map();

  private constructor(private readonly targetPath?: string) {
    if (!targetPath) {
      return;
    }

    try {
      const contents = readFileSync(targetPath, 'utf-8');
      const decoded = JSON.parse(contents);

      this.idMap = new Map(Object.entries(decoded));
    } catch (error) {
      console.warn('Failed to read ItemIdStore from disk!', targetPath, error);
      return;
    }
  }

  private static instance?: ItemIdStore;
  public static init(targetPath?: string): void {
    if (ItemIdStore.instance) {
      throw new Error('init has already been called!');
    }
    ItemIdStore.instance = new ItemIdStore(targetPath);
  }

  public static getInstance(): ItemIdStore {
    if (!ItemIdStore.instance) {
      throw new Error('Call ItemIdStore.init first');
    }
    return ItemIdStore.instance;
  }

  public commitToDisk() {
    if (!this.targetPath) {
      return;
    }
    const contents = JSON.stringify(Object.entries(this.idMap));
    writeFileSync(this.targetPath, contents, { encoding: 'utf-8' });
  }

  public getOrCreate(pathname: string): string {
    if (!this.idMap.has(pathname)) {
      this.idMap.set(pathname, generateId());
    }
    return this.idMap.get(pathname)!;
  }

  public move(oldPathname: string, newPathname: string) {
    const id = this.idMap.get(oldPathname);
    if (!id) {
      return;
    }
    this.idMap.delete(oldPathname);
    this.idMap.set(newPathname, id);
  }

  public delete(pathname: string) {
    this.idMap.delete(pathname);
  }
}
