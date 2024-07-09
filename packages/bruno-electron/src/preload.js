const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('ipcRenderer', {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  on: (channel, handler) => {
    // Deliberately strip event as it includes `sender`
    const subscription = (event, ...args) => handler(...args);
    ipcRenderer.on(channel, subscription);

    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  }
});
// This is used by the 'path' package
contextBridge.exposeInMainWorld('process', {
  platform: process.platform,
  env: process.env,
  cwd: () => process.cwd()
});

// Defined in vite.base.config.ts
contextBridge.exposeInMainWorld('BRUNO_VERSION', BRUNO_VERSION);
contextBridge.exposeInMainWorld('BRUNO_COMMIT', BRUNO_COMMIT);
