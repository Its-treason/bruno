import path from 'node:path';
import fs from 'node:fs/promises';
import { ipcMain, app, BrowserWindow, protocol, dialog } from 'electron';
import { parse, LosslessNumber } from 'lossless-json';
import contentDispositionParser from 'content-disposition';
import mimeTypes from 'mime-types';
import { Response } from '@usebruno/core';
import { format } from 'prettier';

//#region Get response body
async () => {
  // Ensure the response dir directory exists
  const responseCacheDir = path.join(app.getPath('userData'), 'responseCache');
  try {
    fs.mkdir(responseCacheDir);
  } catch {}

  // Delete old files
  const files = await fs.readdir(responseCacheDir);
  for (const file of files) {
    await fs.rm(path.join(responseCacheDir, file));
  }
};

ipcMain.handle('renderer:get-response-body', async (_event, requestId) => {
  const responsePath = path.join(app.getPath('userData'), 'responseCache', requestId);

  let rawData;
  try {
    rawData = await fs.readFile(responsePath);
  } catch (e) {
    return null;
  }

  let data: unknown = null;
  try {
    data = parse(rawData.toString('utf-8'), null, (value) => {
      // By default, this will return the LosslessNumber object, but because it's passed into ipc we
      // need to convert it into a number because LosslessNumber is converted into a weird object
      return new LosslessNumber(value).valueOf();
    });
  } catch (e) {
    data = rawData.toString('utf-8');
  }

  return { data, dataBuffer: rawData.toString('base64') };
});

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
  protocol.handle('response-body', async (req) => {
    const url = new URL(req.url);
    const requestId = url.host;

    // Ensure the request id only contains words and digits but no dots or something
    if (/^[\w\d]+$/.test(requestId) === false) {
      return new globalThis.Response('Invalid request id', {
        status: 400
      });
    }

    const responsePath = path.join(app.getPath('userData'), 'responseCache', requestId);
    const data = await fs.readFile(responsePath);

    if (url.searchParams.has('format')) {
      const parser = url.searchParams.get('format')!;
      let formatted;
      try {
        formatted = await format(data.toString('utf-8'), { parser });
      } catch (error) {
        return new globalThis.Response(String(error), {
          status: 400,
          headers: {
            'Content-Type': 'text/plain'
          }
        });
      }
      return new globalThis.Response(formatted, {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      });
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
function getHeaderValue(response: Response, headerName: string): string | null {
  const value = response.headers[headerName];
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
}

function getFileNameFromContentDispositionHeader(response: Response): string | undefined {
  const contentDisposition = getHeaderValue(response, 'content-disposition');
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

function getFileNameBasedOnContentTypeHeader(response: Response): string {
  const contentType = getHeaderValue(response, 'content-type');
  const extension = (contentType && mimeTypes.extension(contentType)) || 'txt';
  return `response.${extension}`;
}

ipcMain.handle('renderer:save-response-to-file', async (event, itemUid: string, response: Response, url: string) => {
  const defaultPath =
    getFileNameFromContentDispositionHeader(response) ||
    getFileNameFromUrlPath(url) ||
    getFileNameBasedOnContentTypeHeader(response);

  const window = BrowserWindow.fromWebContents(event.sender)!;
  const { filePath } = await dialog.showSaveDialog(window, {
    defaultPath
  });

  if (filePath) {
    const responsePath = path.join(app.getPath('userData'), 'responseCache', itemUid);
    await fs.copyFile(responsePath, filePath);
  }
});
//#endregion
