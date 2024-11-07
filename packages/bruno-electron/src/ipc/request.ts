/*
 * This file is part of bruno-electron.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ipcMain, app } from 'electron';
import path from 'node:path';
import { request as executeRequest, FolderItem, RequestItem } from '@usebruno/core';
import { CollectionSchema, EnvironmentSchema } from '@usebruno/schema';
const { uuid, safeStringifyJSON } = require('../utils/common');
const { saveCancelToken, deleteCancelToken } = require('../utils/cancel-token');
const { cookieJar } = require('../utils/cookies');
const { getPreferences } = require('../store/preferences');
const { getAllRequestsInFolderRecursively } = require('./network/helper');

const dataDir = path.join(app.getPath('userData'), 'responseCache');

ipcMain.handle('send-http-request', async (event, item, collection, environment, globalVariables) => {
  const webContents = event.sender;
  const cancelToken = uuid();
  const abortController = new AbortController();
  saveCancelToken(cancelToken, abortController);

  const res = await executeRequest(
    item,
    collection,
    globalVariables,
    getPreferences(),
    cookieJar,
    dataDir,
    cancelToken,
    abortController,
    // @ts-expect-error Defined in `vite.base.config.js`
    BRUNO_VERSION,
    'standalone',
    environment,
    {
      updateScriptEnvironment: (payload) => {
        webContents.send('main:script-environment-update', payload);
      },
      cookieUpdated: (payload) => {
        webContents.send('main:cookies-update', payload);
      },
      requestEvent: (payload) => {
        webContents.send('main:run-request-event', payload);
      },
      consoleLog: (payload) => {
        webContents.send('main:console-log', payload);
      }
    }
  );
  if (res.error) {
    console.error(res.error);
  }

  deleteCancelToken(cancelToken);

  if (abortController.signal.aborted) {
    throw new Error('Request aborted');
  }

  return {
    status: res.response?.statusCode,
    headers: res.response?.headers,
    size: res.response?.size ?? 0,
    duration: res.response?.responseTime ?? 0,
    isNew: true, // TODO: Remove this
    timeline: res.timeline,
    debug: res.debug.getClean(),
    timings: res.timings.getClean(),
    error: res.error ? String(res.error) : undefined
  };
});

ipcMain.handle(
  'renderer:run-collection-folder',
  async (
    event,
    folder: FolderItem | null,
    collection: CollectionSchema,
    environment: EnvironmentSchema,
    globalVariables: Record<string, unknown>,
    recursive: boolean,
    delay: number
  ) => {
    const folderUid = folder ? folder.uid : null;
    const webContents = event.sender;
    const cancelToken = uuid();
    const abortController = new AbortController();
    saveCancelToken(cancelToken, abortController);

    // @ts-expect-error Here is the type from @bruno/schemas converted into the type of @bruno/core
    // Both types a little different, but are mostly identical.
    // TODO: Use the Type in @usebruno/core
    const items: RequestItem[] = folder ? folder.items : collection.items;

    webContents.send('main:run-folder-event', {
      type: 'testrun-started',
      isRecursive: recursive,
      collectionUid: collection.uid,
      folderUid,
      cancelTokenUid: cancelToken
    });

    const folderRequests: RequestItem[] = [];
    if (recursive) {
      folderRequests.push(...getAllRequestsInFolderRecursively(items));
    } else {
      // Filter out folder from current folder
      for (const item of items) {
        if (item.request) {
          folderRequests.push(item);
        }
      }

      // sort requests by seq property
      folderRequests.sort((a, b) => {
        return a.seq - b.seq;
      });
    }

    let currentRequestIndex = 0;
    let nJumps = 0; // count the number of jumps to avoid infinite loops
    while (currentRequestIndex < folderRequests.length) {
      const item = folderRequests[currentRequestIndex];

      if (!isNaN(delay) && delay > 0) {
        // Send the queue event so ui shows its loading
        webContents.send('main:run-folder-event', {
          type: 'request-delayed',
          itemUid: item.uid,
          collectionUid: collection.uid,
          folderUid
        });

        await new Promise<void>((resolve) => {
          abortController.signal.addEventListener('abort', () => resolve());
          setTimeout(() => resolve(), delay);
        });
      }

      if (abortController.signal.aborted) {
        deleteCancelToken(cancelToken);
        webContents.send('main:run-folder-event', {
          type: 'testrun-ended',
          collectionUid: collection.uid,
          folderUid,
          error: 'Request runner cancelled'
        });
        return;
      }

      const res = await executeRequest(
        item,
        collection as any, // @usebruno/core uses its own type for collection
        globalVariables,
        getPreferences(),
        cookieJar,
        dataDir,
        cancelToken,
        abortController,
        // @ts-expect-error Defined in `vite.base.config.js`
        BRUNO_VERSION,
        'runner',
        environment,
        {
          runFolderEvent: (payload) => {
            webContents.send('main:run-folder-event', {
              ...payload,
              folderUid
            });
          },
          updateScriptEnvironment: (payload) => {
            webContents.send('main:script-environment-update', payload);
          },
          cookieUpdated: (payload) => {
            webContents.send('main:cookies-update', payload);
          },
          consoleLog: (payload) => {
            console.log('=== start console.log from your script ===');
            console.log(payload.args);
            console.log('=== end console.log from your script ===');
            try {
              webContents.send('main:console-log', payload);
            } catch (e) {
              console.error(`The above console.log could not be sent to electron: ${e}`);
              webContents.send('main:console-log', {
                type: 'error',
                args: [`console.${payload.type} could not be sent to electron: ${e}`, safeStringifyJSON(payload)]
              });
            }
          }
        }
      );
      if (abortController.signal.aborted) {
        webContents.send('main:run-folder-event', {
          type: 'error',
          error: 'Aborted',
          responseReceived: {},
          collectionUid: collection.uid,
          itemUid: item.uid,
          folderUid
        });
        continue;
      }

      if (res.error) {
        webContents.send('main:run-folder-event', {
          type: 'error',
          error: String(res.error) || 'An unknown error occurred while running the request',
          responseReceived: {},
          collectionUid: collection.uid,
          itemUid: item.uid,
          folderUid
        });
      }

      if (typeof res.nextRequestName !== 'string') {
        currentRequestIndex++;
        continue;
      }
      nJumps++;
      if (nJumps > 100) {
        throw new Error('Too many jumps, possible infinite loop');
      }
      const nextRequestIdx = folderRequests.findIndex((request) => request.name === res.nextRequestName);
      if (nextRequestIdx >= 0) {
        currentRequestIndex = nextRequestIdx;
      } else {
        console.error("Could not find request with name '" + res.nextRequestName + "'");
        currentRequestIndex++;
      }
    }

    deleteCancelToken(cancelToken);

    webContents.send('main:run-folder-event', {
      type: 'testrun-ended',
      collectionUid: collection.uid,
      folderUid,
      error: null
    });
  }
);
