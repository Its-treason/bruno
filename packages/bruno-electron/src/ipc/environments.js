const { ipcMain } = require('electron');
const { getLastSelectedEnvironment, updateLastSelectedEnvironment } = require('../store/last-selected-environments');

ipcMain.handle('renderer:get-last-selected-environment', async (_event, collectionUid) => {
  return getLastSelectedEnvironment(collectionUid);
});

ipcMain.handle('renderer:update-last-selected-environment', async (_event, collectionUid, environmentName) => {
  updateLastSelectedEnvironment(collectionUid, environmentName);
});
