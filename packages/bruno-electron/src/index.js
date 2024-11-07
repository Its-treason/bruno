const path = require('path');
const http = require('http');
const fs = require('fs');
const { format } = require('url');
const { BrowserWindow, app, Menu, ipcMain, shell } = require('electron');
const { setContentSecurityPolicy } = require('electron-util');

const menuTemplate = require('./app/menu-template');
const { openCollection } = require('./app/collections');
const LastOpenedCollections = require('./store/last-opened-collections');
const registerNetworkIpc = require('./ipc/network');
const registerCollectionsIpc = require('./ipc/collection');
const registerPreferencesIpc = require('./ipc/preferences');
const Watcher = require('./app/watcher');
const { loadWindowState, saveBounds, saveMaximized } = require('./utils/window');
const registerNotificationsIpc = require('./ipc/notifications');
const registerEnvironmentsIpc = require('./ipc/environments');
require('./ipc/zustand-store');
require('./ipc/request');

const lastOpenedCollections = new LastOpenedCollections();

// Reference: https://content-security-policy.com/
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src * 'self' blob: 'unsafe-inline' 'unsafe-eval'",
  "connect-src * 'unsafe-inline'",
  "font-src 'self' https:",
  // this has been commented out to make oauth2 work
  // "form-action 'none'",
  // we make an exception and allow http for images so that
  // they can be used as link in the embedded markdown editors
  "img-src 'self' blob: data: http: https:",
  "media-src 'self' blob: data: https:",
  "style-src 'self' 'unsafe-inline' https:"
];
setContentSecurityPolicy(contentSecurityPolicy.join(';') + ';');

const menu = Menu.buildFromTemplate(menuTemplate);

let mainWindow;
let watcher;
let launchFailed = false;

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  Menu.setApplicationMenu(menu);
  const { maximized, x, y, width, height } = loadWindowState();

  mainWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    minWidth: 1000,
    minHeight: 640,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true
    },
    title: 'Bruno lazer',
    icon: path.join(__dirname, 'about/256x256.png'),
    // we will bring this back
    // see https://github.com/usebruno/bruno/issues/440
    // autoHideMenuBar: true
    show: false
  });
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  if (maximized) {
    mainWindow.maximize();
  }

  if (app.isPackaged) {
    const staticPath = path.join(__dirname, '../../web/');
    const server = http.createServer((req, res) => {
      const filePath = path.join(staticPath, req.url === '/' ? 'index.html' : req.url);

      const stream = fs.createReadStream(filePath);

      stream.on('open', () => {
        res.writeHead(200);
        stream.pipe(res);
      });

      stream.on('error', (err) => {
        if (err.code === 'ENOENT') {
          res.writeHead(404);
          res.end('File not found');
        } else {
          res.writeHead(500);
          res.end('Internal server error');
        }
      });
    });
    server.listen(0, '127.0.0.1', () => {
      const url = `http://127.0.0.1:${server.address().port}`;
      mainWindow.loadURL(url).catch((reason) => {
        console.error(`Error: Failed to load URL: "${url}" (Electron shows a blank screen because of this).`);
        console.error('Original message:', reason);
        console.error(
          'If you are using an official production build: the above error is most likely a bug! ' +
            ' Please report this under: https://github.com/usebruno/bruno/issues'
        );
        mainWindow.loadURL(`data:text/html;charset=utf,Failed to load: ${reason}`);
        launchFailed = true;
      });
    });
  } else {
    mainWindow.loadURL('http://127.0.0.1:3000').catch((reason) => {
      console.error(
        `Error: Failed to load URL: "http://127.0.0.1:3000" (Electron shows a blank screen because of this).`
      );
      console.error('Original message:', reason);
      console.error(
        'Could not connect to Next.Js dev server, is it running?' +
          ' Start the dev server using "npm run dev:web" and restart electron'
      );
      mainWindow.loadURL(`data:text/html;charset=utf,Failed to load: ${reason}`);
      launchFailed = true;
    });
  }

  watcher = new Watcher();

  const handleBoundsChange = () => {
    if (!mainWindow.isMaximized()) {
      saveBounds(mainWindow);
    }
  };

  mainWindow.on('resize', handleBoundsChange);
  mainWindow.on('move', handleBoundsChange);

  mainWindow.on('maximize', () => saveMaximized(true));
  mainWindow.on('unmaximize', () => saveMaximized(false));
  mainWindow.on('close', (e) => {
    if (launchFailed) {
      return;
    }
    e.preventDefault();
    ipcMain.emit('main:start-quit-flow');
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // register all ipc handlers
  registerNetworkIpc(mainWindow);
  registerCollectionsIpc(mainWindow, watcher, lastOpenedCollections);
  registerPreferencesIpc(mainWindow, watcher, lastOpenedCollections);
  registerNotificationsIpc(mainWindow, watcher);
  registerEnvironmentsIpc(mainWindow, watcher);
});

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit);

// Open collection from Recent menu (#1521)
app.on('open-file', (event, path) => {
  openCollection(mainWindow, watcher, path);
});
