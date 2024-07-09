/// <reference types="@rsbuild/core/types" />

declare global {
  interface Window {
    ipcRenderer: {
      invoke: <T = any>(channel: string, ...args: any[]) => Promise<T>;
      on: (channel: string, handler: (...args: any[]) => void) => () => void;
    };
    process: {
      platform: NodeJS.Platform;
      env: NodeJS.ProcessEnv;
      cwd: () => string;
    };
    BRUNO_VERSION: string;
    BRUNO_COMMIT: string;
  }
}

export {};
