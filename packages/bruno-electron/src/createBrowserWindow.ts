import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import http from 'node:http';
import fs from 'node:fs';
const { loadWindowState, saveBounds, saveMaximized } = require('./utils/window');

export function createBrowserWindow(loadState = true): BrowserWindow {
  // The second windows should not be opened maximised
  const windowState = loadState ? loadWindowState() : null;

  const mainWindow = new BrowserWindow({
    ...windowState,
    minWidth: 1000,
    minHeight: 640,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      spellcheck: false,
      partition: 'persist:main-window'
    },
    title: 'Bruno lazer',
    icon: path.join(__dirname, 'about/256x256.png')
    // we will bring this back
    // see https://github.com/usebruno/bruno/issues/440
    // autoHideMenuBar: true
  });
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  if (windowState?.maximized) {
    mainWindow.maximize();
  }

  let launchFailed = false;
  if (app.isPackaged) {
    const staticPath = path.join(__dirname, '../../web/');
    const server = http.createServer((req, res) => {
      const filePath = path.join(staticPath, req.url === '/' ? 'index.html' : req.url!);

      const stream = fs.createReadStream(filePath);

      stream.on('open', () => {
        res.writeHead(200);
        stream.pipe(res);
      });

      stream.on('error', (err) => {
        // @ts-expect-error
        if (err.code === 'ENOENT') {
          res.writeHead(404).end('File not found');
          return;
        }
        res.writeHead(500).end('Internal server error');
      });
    });
    server.listen(0, '127.0.0.1', () => {
      // @ts-expect-error
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
    ipcMain.emit('main:start-quit-flow', mainWindow);
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  return mainWindow;
}
