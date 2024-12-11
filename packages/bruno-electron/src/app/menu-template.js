const { ipcMain, MenuItem, BrowserWindow } = require('electron');
const os = require('os');
const { join } = require('path');
// prettier-ignore
const openAboutWindow = (require('about-window')).default;

const template = [
  {
    label: 'Collection',
    submenu: [
      {
        label: 'Open Collection',
        click(_menuItem, browserWindow) {
          ipcMain.emit('main:open-collection', browserWindow);
        }
      },
      {
        label: 'Open Recent',
        role: 'recentdocuments',
        visible: os.platform() == 'darwin',
        submenu: [
          {
            label: 'Clear Recent',
            role: 'clearrecentdocuments'
          }
        ]
      },
      {
        label: 'Preferences',
        accelerator: 'CommandOrControl+,',
        click(_menuItem, browserWindow) {
          ipcMain.emit('main:open-preferences', browserWindow);
        }
      },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'toggledevtools' },
      {
        label: 'Reload',
        click: (_item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        }
      },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    role: 'window',
    submenu: [{ role: 'minimize' }, { role: 'close', accelerator: 'CommandOrControl+Shift+Q' }]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'About Bruno',
        click: () =>
          openAboutWindow({
            product_name: 'Bruno',
            icon_path: join(__dirname, './about/256x256.png'),
            css_path: join(__dirname, './about/about.css'),
            homepage: 'https://www.usebruno.com/',
            package_json_dir: join(__dirname, '../..')
          })
      },
      { label: 'Documentation', click: () => ipcMain.emit('main:open-docs') }
    ]
  }
];

module.exports = template;
