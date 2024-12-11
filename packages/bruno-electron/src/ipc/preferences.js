const { ipcMain, BrowserWindow } = require('electron');
const { getPreferences, savePreferences, preferencesUtil } = require('../store/preferences');
const { isDirectory } = require('../utils/filesystem');
const { openCollection } = require('../app/collections');
const LastOpenedCollection = require('../store/last-opened-collections');

ipcMain.handle('renderer:ready', async (event) => {
  // load preferences
  const preferences = getPreferences();

  const mainWindow = BrowserWindow.fromWebContents(event.sender);
  mainWindow.webContents.send('main:load-preferences', preferences);

  const systemProxyVars = preferencesUtil.getSystemProxyEnvVariables();
  const { http_proxy, https_proxy, no_proxy } = systemProxyVars || {};
  mainWindow.webContents.send('main:load-system-proxy-env', { http_proxy, https_proxy, no_proxy });

  // reload last opened collections
  const lastOpenedCollections = LastOpenedCollection.getInstance();
  const lastOpened = lastOpenedCollections.getAll();

  for (const collectionPath of lastOpened) {
    if (isDirectory(collectionPath)) {
      await openCollection(collectionPath, true);
    }
  }
});

ipcMain.on('main:open-preferences', (browserWindow) => {
  browserWindow.webContents.send('main:open-preferences');
});

ipcMain.handle('renderer:save-preferences', async (_event, preferences) => {
  await savePreferences(preferences);
});
