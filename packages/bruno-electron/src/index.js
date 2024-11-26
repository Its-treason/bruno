const { BrowserWindow, app, Menu } = require('electron');
const { setContentSecurityPolicy } = require('electron-util');

const menuTemplate = require('./app/menu-template');
const { openCollection } = require('./app/collections');
require('./ipc/collection');
require('./ipc/preferences');
require('./ipc/environments');
const { createBrowserWindow } = require('./createBrowserWindow');
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
