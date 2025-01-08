const { BrowserWindow, app, Menu, session } = require('electron');
const { setContentSecurityPolicy } = require('electron-util');
const { setTimeout } = require('node:timers/promises');

const menuTemplate = require('./app/menu-template');
const { openCollection } = require('./app/collections');
require('./ipc/collection');
require('./ipc/preferences');
require('./ipc/environments');
const { createBrowserWindow, MAIN_WINDOW_PARTITION } = require('./createBrowserWindow');
require('./ipc/zustand-store');
require('./ipc/request');
require('./ipc/responseBody');

// Reference: https://content-security-policy.com/
const contentSecurityPolicy = [
  "default-src 'self' response-body:",
  "script-src * 'self' blob: 'unsafe-inline' 'unsafe-eval'",
  "connect-src * 'unsafe-inline' response-body:",
  "font-src 'self' https:",
  // this has been commented out to make oauth2 work
  // "form-action 'none'",
  // we make an exception and allow http for images so that
  // they can be used as link in the embedded markdown editors
  "img-src 'self' blob: data: http: https: response-body:",
  "media-src 'self' blob: data: https: response-body:",
  "style-src 'self' 'unsafe-inline' https:"
];
setContentSecurityPolicy(contentSecurityPolicy.join(';') + ';');

const gotLock = app.requestSingleInstanceLock();

const menu = Menu.buildFromTemplate(menuTemplate);

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  if (!gotLock) {
    console.error('Other process of Bruno lazer still running! Will open window in other process.');
    app.quit();
    return;
  }

  if (!app.isPackaged) {
    try {
      // `electron-devtools-installer` is only a dev dependency
      const { installExtension, REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } = await import('electron-devtools-installer');

      const mainSession = session.fromPartition(MAIN_WINDOW_PARTITION);
      await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS], {
        loadExtensionOptions: { allowFileAccess: true },
        session: mainSession
      });

      // See: https://github.com/electron/electron/issues/41613#issuecomment-2576307939
      await setTimeout(1_000);
      for (const extension of mainSession.getAllExtensions()) {
        await mainSession.loadExtension(extension.path);
      }
    } catch (err) {
      console.error('An error occurred while loading extensions: ', err);
    }
  }

  Menu.setApplicationMenu(menu);
  createBrowserWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createBrowserWindow(false);
    }
  });

  app.on('second-instance', () => {
    createBrowserWindow(false);
  });
});

// Quit the app once all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Open collection from Recent menu (#1521)
app.on('open-file', (_event, path) => {
  openCollection(path);
});
