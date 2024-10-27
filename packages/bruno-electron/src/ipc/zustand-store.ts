/*
 * This file is part of bruno-electron.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ipcMain, app, safeStorage } from 'electron';
import path from 'node:path';
import * as fs from 'node:fs/promises';

const storagePath = path.join(app.getPath('userData'), 'storage');
fs.mkdir(storagePath, { recursive: true });

ipcMain.handle('zustand:get-item', async (_evt, name) => {
  const rawData = await fs.readFile(path.join(storagePath, name));
  return safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(rawData) : rawData.toString('utf-8');
});

ipcMain.handle('zustand:set-item', async (_evt, name, data) => {
  const encryptedData = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(data) : data;
  await fs.writeFile(path.join(storagePath, name), encryptedData);
});

ipcMain.handle('zustand:remove-item', async (_evt, name) => {
  await fs.unlink(path.join(storagePath, name));
});
