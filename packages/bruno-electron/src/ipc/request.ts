/*
 * This file is part of bruno-electron.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ipcMain, app } from 'electron';
import path from 'node:path';
import { request as executeRequest, FolderItem, RequestItem } from '@usebruno/core';
import { CollectionSchema, EnvironmentSchema } from '@usebruno/schema';
import { getIntrospectionQuery } from 'graphql';
import {
  clearElectronOAuthSession,
  handleAuthorizationCodeInElectron
} from '../utils/handleAuthorizationCodeInElectron';
const { uuid, safeStringifyJSON } = require('../utils/common');
const { cookieJar } = require('../utils/cookies');
const { getPreferences } = require('../store/preferences');

const getAllRequestsInFolderRecursively = (items: any[] = []) => {
  // This is the sort function from useRequestList.tsx
  items.sort((a, b) => {
    if (a.seq === undefined && b.seq !== undefined) {
      return -1;
    } else if (a.seq !== undefined && b.seq === undefined) {
      return 1;
    } else if (a.seq === undefined && b.seq === undefined) {
      return 0;
    }
    return a.seq < b.seq ? -1 : 1;
  });

  const requests: any[] = [];
  for (const item of items) {
    if (item.type !== 'folder') {
      requests.push(item);
    } else {
      requests.push(...getAllRequestsInFolderRecursively(item.items));
    }
  }

  return requests;
};

const responseDataDir = path.join(app.getPath('userData'), 'responseCache');

const cancelTokens = new Map<string, AbortController>();

ipcMain.handle('send-http-request', async (event, item, collection, environment, globalVariables) => {
  const webContents = event.sender;
  const cancelToken = uuid();
  const abortController = new AbortController();
  cancelTokens.set(cancelToken, abortController);

  const res = await executeRequest(
    item,
    collection,
    globalVariables,
    getPreferences(),
    cookieJar,
    responseDataDir,
    cancelToken,
    abortController,
    // @ts-expect-error Defined in `vite.base.config.js`
    BRUNO_VERSION,
    'standalone',
    handleAuthorizationCodeInElectron,
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

  cancelTokens.delete(cancelToken);

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
    cancelTokens.set(cancelToken, abortController);

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
        cancelTokens.delete(cancelToken);
        webContents.send('main:run-folder-event', {
          type: 'testrun-ended',
          collectionUid: collection.uid,
          folderUid,
          error: 'Request runner cancelled'
        });
        return;
      }

      const { error, nextRequestName } = await executeRequest(
        item,
        collection as any, // @usebruno/core uses its own type for collection
        globalVariables,
        getPreferences(),
        cookieJar,
        responseDataDir,
        cancelToken,
        abortController,
        // @ts-expect-error Defined in `vite.base.config.js`
        BRUNO_VERSION,
        'runner',
        handleAuthorizationCodeInElectron,
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

      if (error) {
        webContents.send('main:run-folder-event', {
          type: 'error',
          error: String(error) || 'An unknown error occurred while running the request',
          responseReceived: {},
          collectionUid: collection.uid,
          itemUid: item.uid,
          folderUid
        });
      }

      if (typeof nextRequestName !== 'string') {
        currentRequestIndex++;
        continue;
      }

      nJumps++;
      if (nJumps > 100) {
        throw new Error('Too many jumps, possible infinite loop');
      }
      const nextRequestIdx = folderRequests.findIndex((request) => request.name === nextRequestName);
      if (nextRequestIdx >= 0) {
        currentRequestIndex = nextRequestIdx;
      } else {
        console.error("Could not find request with name '" + nextRequestName + "'");
        currentRequestIndex++;
      }
    }

    cancelTokens.delete(cancelToken);

    webContents.send('main:run-folder-event', {
      type: 'testrun-ended',
      collectionUid: collection.uid,
      folderUid,
      error: null
    });
  }
);

ipcMain.handle(
  'fetch-gql-schema',
  async (event, endpoint, environment, requestItem: RequestItem['request'], collection, globalVariables) => {
    const webContents = event.sender;
    const cancelToken = uuid();
    const abortController = new AbortController();
    cancelTokens.set(cancelToken, abortController);

    const body = {
      mode: 'json',
      json: JSON.stringify({
        query: getIntrospectionQuery()
      })
    } as const;

    const headers = requestItem.headers;
    headers.push({
      enabled: true,
      name: 'accept',
      value: 'application/json'
    });

    const item: RequestItem = {
      depth: 0,
      draft: null,
      filename: 'graphql-introspection',
      name: 'graphql-introspection',
      pathname: '',
      seq: 0,
      type: 'http-request',
      uid: uuid(),
      request: {
        ...requestItem,
        assertions: [],
        tests: '',
        script: { req: '', res: '' },
        params: [],
        headers,
        url: endpoint,
        body
      }
    };

    const res = await executeRequest(
      item,
      collection,
      globalVariables,
      getPreferences(),
      cookieJar,
      responseDataDir,
      cancelToken,
      abortController,
      // @ts-expect-error Defined in `vite.base.config.js`
      BRUNO_VERSION,
      'standalone',
      handleAuthorizationCodeInElectron,
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
      throw res.error;
    }

    cancelTokens.delete(cancelToken);

    if (abortController.signal.aborted) {
      throw new Error('Request aborted');
    }

    return {
      status: res.response?.statusCode,
      headers: res.response?.headers,
      size: res.response?.size ?? 0,
      data: res.responseBody
    };
  }
);

ipcMain.handle('send-collection-oauth2-request', async (event, collection, environment, globalVariables) => {
  const webContents = event.sender;
  const cancelToken = uuid();
  const abortController = new AbortController();
  cancelTokens.set(cancelToken, abortController);

  const request = collection.root.request;
  if (request?.auth.mode !== 'oauth2') {
    throw new Error(`Auth mode must be "oauth2", but is actually: ${request?.auth.mode}`);
  }

  const item: RequestItem = {
    depth: 0,
    draft: null,
    filename: 'collection-oauth2-request',
    name: 'collection-oauth2-request',
    pathname: '',
    seq: 0,
    type: 'http-request',
    uid: uuid(),
    request: {
      headers: [],
      auth: { mode: 'inherit' },
      assertions: [],
      tests: '',
      script: { req: '', res: '' },
      params: [],
      url: '',
      body: { mode: 'none' },
      docs: '',
      maxRedirects: 25,
      method: 'GET',
      timeout: 60_000,
      vars: { req: [], res: [] }
    }
  };

  const res = await executeRequest(
    item,
    collection,
    globalVariables,
    getPreferences(),
    cookieJar,
    responseDataDir,
    cancelToken,
    abortController,
    // @ts-expect-error Defined in `vite.base.config.js`
    BRUNO_VERSION,
    'standalone',
    handleAuthorizationCodeInElectron,
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

  return {
    status: res.response?.statusCode,
    headers: res.response?.headers,
    size: res.response?.size ?? 0,
    data: res.responseBody
  };
});

ipcMain.handle('clear-oauth2-cache', async (_event, collectionUid) => {
  await clearElectronOAuthSession(collectionUid);
});

ipcMain.handle('cancel-http-request', async (_event, cancelTokenUid) => {
  cancelTokens.get(cancelTokenUid)?.abort();
  cancelTokens.delete(cancelTokenUid);
});
