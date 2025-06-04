const { ipcMain, BrowserWindow } = require('electron');
const { getPreferences, savePreferences } = require('../store/preferences');
const { isDirectory } = require('../utils/filesystem');
const { openCollection } = require('../app/collections');
const LastOpenedCollection = require('../store/last-opened-collections');

ipcMain.handle('renderer:ready', async (event) => {
  const preferences = await getPreferences();

  const mainWindow = BrowserWindow.fromWebContents(event.sender);
  mainWindow.webContents.send('main:load-preferences', preferences);

  const { http_proxy, HTTP_PROXY, https_proxy, HTTPS_PROXY, no_proxy, NO_PROXY } = process.env;
  mainWindow.webContents.send('main:load-system-proxy-env', {
    http_proxy: http_proxy || HTTP_PROXY,
    https_proxy: https_proxy || HTTPS_PROXY,
    no_proxy: no_proxy || NO_PROXY
  });

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
