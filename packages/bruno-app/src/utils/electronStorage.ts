import { StateStorage } from 'zustand/middleware';

export const electronStorage: StateStorage = {
  getItem: async (name) => {
    try {
      return await window.ipcRenderer.invoke('zustand:get-item', name);
    } catch (e) {
      console.error(`Could not load store data for "${name}":`, e)
    }
  },
  setItem: (name, data) => {
    return window.ipcRenderer.invoke('zustand:set-item', name, data);
  },
  removeItem: (name) => {
    return window.ipcRenderer.invoke('zustand:remove-item', name);
  }
};

type JsonStorageOptions = {
    reviver: (key: string, value: unknown) => unknown;
    replacer: (key: string, value: unknown) => unknown;
};

export const mapHandler: JsonStorageOptions = {
    replacer: (_key, value) => {
        if (value instanceof Map) {
            return {
                __JS_MAP_OBJ__: true,
                value: Array.from(value.entries()),
            };
        }
        return value;
    },
    reviver: (_key, value) => {
        if (typeof value === 'object' && value !== null && value['__JS_MAP_OBJ__'] === true) {
            // @ts-expect-error
            return new Map(value.value);
        }
        return value;
    }
}
