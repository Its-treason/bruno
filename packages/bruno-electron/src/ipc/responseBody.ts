/*
 * This file is part of bruno-electron.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import { ipcMain, app, BrowserWindow, protocol, dialog, session } from 'electron';
import contentDispositionParser from 'content-disposition';
import mimeTypes from 'mime-types';
import { Response } from '@usebruno/core';
import { WorkerManager } from '../worker/manager';

//#region Get response body
(async () => {
  // Ensure the response dir directory exists
  const responseCacheDir = path.join(app.getPath('userData'), 'responseCache');
  try {
    await fs.mkdir(responseCacheDir);
  } catch {}

  // Delete old files
  const files = await fs.readdir(responseCacheDir);
  for (const file of files) {
    await fs.rm(path.join(responseCacheDir, file));
  }
})();

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'response-body',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true
    }
  }
]);
app.once('ready', () => {
  const mainWindowSession = session.fromPartition('persist:main-window');

  mainWindowSession.protocol.handle('response-body', async (req) => {
    const url = new URL(req.url);
    const requestId = url.host;

    // The request id must be an Uuid. Created in bruno-core/src/request/index.ts
    const regexUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    if (regexUuid.test(requestId) === false) {
      return new globalThis.Response('Invalid request id', {
        status: 400
      });
    }

    const responsePath = path.join(app.getPath('userData'), 'responseCache', requestId);
    const data = await fs.readFile(responsePath);

    // This parameter is used by the TextResultViewer component
    if (url.searchParams.has('format')) {
      const parser = url.searchParams.get('format')!;
      const manager = WorkerManager.getInstance();
      try {
        const formatted = await manager.format(data.toString('utf-8'), parser);
        return new globalThis.Response(formatted, {
          status: 200
        });
      } catch (error) {
        return new globalThis.Response(String(error), {
          status: 400
        });
      }
    }

    return new globalThis.Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    });
  });
});
//#endregion

//#region Save response to file
function getHeaderValue(headers: Record<string, string[]>, headerName: string): string | null {
  const value = headers[headerName];
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
}

function getFileNameFromContentDispositionHeader(headers: Record<string, string[]>): string | undefined {
  const contentDisposition = getHeaderValue(headers, 'content-disposition');
  if (!contentDisposition) {
    return undefined;
  }
  try {
    const disposition = contentDispositionParser.parse(contentDisposition);
    return disposition?.parameters['filename'];
  } catch (error) {
    return undefined;
  }
}

function getFileNameFromUrlPath(url: string): string | undefined {
  const lastPathLevel = new URL(url).pathname.split('/').pop();
  if (lastPathLevel && /\..+/.exec(lastPathLevel)) {
    return lastPathLevel;
  }
  return undefined;
}

function getFileNameBasedOnContentTypeHeader(headers: Record<string, string[]>): string {
  const contentType = getHeaderValue(headers, 'content-type');
  const extension = (contentType && mimeTypes.extension(contentType)) || 'txt';
  return `response.${extension}`;
}

ipcMain.handle(
  'renderer:save-response-to-file',
  async (event, itemUid: string, headers: Record<string, string[]>, url: string) => {
    const defaultPath =
      getFileNameFromContentDispositionHeader(headers) ||
      getFileNameFromUrlPath(url) ||
      getFileNameBasedOnContentTypeHeader(headers);

    const window = BrowserWindow.fromWebContents(event.sender)!;
    const { filePath } = await dialog.showSaveDialog(window, {
      defaultPath
    });

    if (filePath) {
      const responsePath = path.join(app.getPath('userData'), 'responseCache', itemUid);
      await fs.copyFile(responsePath, filePath);
    }
  }
);
//#endregion
