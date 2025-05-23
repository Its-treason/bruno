import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';
import find from 'lodash/find';
import get from 'lodash/get';
import trim from 'lodash/trim';
import { insertTaskIntoQueue } from 'providers/ReduxStore/slices/app';
import toast from 'react-hot-toast';
import {
  findCollectionByUid,
  findEnvironmentInCollection,
  findItemInCollection,
  findParentItemInCollection,
  getItemsToResequence,
  isItemAFolder,
  refreshUidsInItem,
  isItemARequest,
  moveCollectionItem,
  moveCollectionItemToRootOfCollection,
  transformRequestToSaveToFilesystem
} from 'utils/collections';
import { collectionSchema, requestItemSchema, environmentSchema } from '@usebruno/schema';
import { PATH_SEPARATOR, getDirectoryName } from 'utils/common/platform';
import { cancelNetworkRequest, sendNetworkRequest } from 'utils/network';

import {
  collectionAddEnvFileEvent as _collectionAddEnvFileEvent,
  createCollection as _createCollection,
  removeCollection as _removeCollection,
  selectEnvironment as _selectEnvironment,
  sortCollections as _sortCollections,
  filterCollections as _filterCollections,
  updateLastAction,
  changeCollectionCustomOrder
} from './index';

import { each } from 'lodash';
import { closeAllCollectionTabs } from 'providers/ReduxStore/slices/tabs';
import { resolveRequestFilename } from 'utils/common/platform';
import { uuid, waitForNextTick } from 'utils/common';
import { sendCollectionOauth2Request as _sendCollectionOauth2Request } from 'utils/network/index';
import { parsePathParams, parseQueryParams, splitOnFirst } from 'utils/url';
import { globalEnvironmentStore } from 'src/store/globalEnvironmentStore';
import { responseStore } from 'src/store/responseStore';
import { runnerStore } from 'src/store/runnerStore';

export const renameCollection = (newName, collectionUid) => (dispatch, getState) => {
  const state = getState();
  const collection = findCollectionByUid(state.collections.collections, collectionUid);

  return new Promise((resolve, reject) => {
    if (!collection) {
      return reject(new Error('Collection not found'));
    }

    ipcRenderer.invoke('renderer:rename-collection', newName, collection.pathname).then(resolve).catch(reject);
  });
};

export const saveRequest = (itemUid, collectionUid, saveSilently) => async (dispatch, getState) => {
  const state = getState();
  const collection = findCollectionByUid(state.collections.collections, collectionUid);

  if (!collection) {
    throw new Error('Collection not found');
  }

  const collectionCopy = cloneDeep(collection);
  const item = findItemInCollection(collectionCopy, itemUid);
  if (!item) {
    throw new Error('Not able to locate item');
  }

  const itemToSave = transformRequestToSaveToFilesystem(item);
  const { ipcRenderer } = window;

  const parseResult = requestItemSchema.safeParse(itemToSave);
  if (!parseResult.success) {
    toast.error('Could not save, request item is invalid');
    throw new Error(`Item is invalid: ${parseResult.error}`);
  }

  try {
    await ipcRenderer.invoke('renderer:save-request', item.pathname, parseResult.data);
  } catch (error) {
    toast.error('Failed to save request!');
    throw error;
  }
  if (!saveSilently) {
    toast.success('Request saved successfully');
  }
};

export const saveMultipleRequests = (items) => (dispatch, getState) => {
  const state = getState();
  const { collections } = state.collections;

  return new Promise((resolve, reject) => {
    const itemsToSave = [];
    each(items, (item) => {
      const collection = findCollectionByUid(collections, item.collectionUid);
      if (collection) {
        const itemToSave = transformRequestToSaveToFilesystem(item);
        const itemIsValid = requestItemSchema.safeParse(itemToSave).success;
        if (itemIsValid) {
          itemsToSave.push({
            item: itemToSave,
            pathname: item.pathname
          });
        }
      }
    });

    const { ipcRenderer } = window;

    ipcRenderer
      .invoke('renderer:save-multiple-requests', itemsToSave)
      .then(resolve)
      .catch((err) => {
        toast.error('Failed to save requests!');
        reject(err);
      });
  });
};

export const saveCollectionRoot = (collectionUid) => (dispatch, getState) => {
  const state = getState();
  const collection = findCollectionByUid(state.collections.collections, collectionUid);

  return new Promise((resolve, reject) => {
    if (!collection) {
      return reject(new Error('Collection not found'));
    }

    const { ipcRenderer } = window;

    ipcRenderer
      .invoke('renderer:save-collection-root', collection.pathname, collection.root)
      .then(() => toast.success('Collection Settings saved successfully'))
      .then(resolve)
      .catch((err) => {
        toast.error('Failed to save collection settings!');
        reject(err);
      });
  });
};

export const saveFolderRoot = (collectionUid, folderUid) => (dispatch, getState) => {
  const state = getState();
  const collection = findCollectionByUid(state.collections.collections, collectionUid);
  const folder = findItemInCollection(collection, folderUid);

  return new Promise((resolve, reject) => {
    if (!collection) {
      return reject(new Error('Collection not found'));
    }

    if (!folder) {
      return reject(new Error('Folder not found'));
    }

    const { ipcRenderer } = window;

    const folderData = {
      name: folder.name,
      pathname: folder.pathname,
      root: folder.root ?? {}
    };

    ipcRenderer
      .invoke('renderer:save-folder-root', folderData)
      .then(() => toast.success('Folder Settings saved successfully'))
      .then(resolve)
      .catch((err) => {
        toast.error('Failed to save folder settings!');
        reject(err);
      });
  });
};

export const sendCollectionOauth2Request = (collectionUid, itemUid) => (dispatch, getState) => {
  const state = getState();
  const collection = findCollectionByUid(state.collections.collections, collectionUid);

  return new Promise((resolve, reject) => {
    if (!collection) {
      return reject(new Error('Collection not found'));
    }

    const environment = findEnvironmentInCollection(collection, collection.activeEnvironmentUid);

    _sendCollectionOauth2Request(collection, environment, collection.runtimeVariables)
      .then((response) => {
        if (response?.data?.error) {
          toast.error(response?.data?.error);
        } else {
          toast.success('Request made successfully');
        }
        return response;
      })
      .then(resolve)
      .catch((err) => {
        toast.error(err.message);
      });
  });
};

export const sendRequest = (item, collectionUid) => async (_dispatch, getState) => {
  const state = getState();
  const collection = findCollectionByUid(state.collections.collections, collectionUid);
  if (!collection) {
    throw new Error(`Collection with id ${collectionUid} not found!`);
  }

  const environment = findEnvironmentInCollection(collection, collection.activeEnvironmentUid);

  const store = responseStore.getState();
  // Prevent a request from being sent, while a request is still running
  const lastRequestId = store.requestResponses.get(item.uid)?.at(-1);
  if (lastRequestId) {
    const response = store.responses.get(lastRequestId);
    if (response.requestState !== 'received' && response.requestState !== 'cancelled') {
      return;
    }
  }

  try {
    await sendNetworkRequest(item, collection, environment);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('Request cancelled')) {
      console.warn('Request canceleed!! REMOVE ME');
      store.cancelResponse(item.uid);
      return;
    }

    store.responseError(item.uid, message);
  }
};

export const cancelRequest = (cancelTokenUid, requestId) => () => {
  cancelNetworkRequest(cancelTokenUid)
    .then(() => {
      responseStore.getState().cancelResponse(requestId);
    })
    .catch((err) => console.error('Could not cancel request', err));
};

export const cancelRunnerExecution = (cancelTokenUid) => (dispatch) => {
  cancelNetworkRequest(cancelTokenUid).catch((err) => console.log(err));
};

export const runCollectionFolder = (collectionUid, folderUid, recursive, delay) => async (_dispatch, getState) => {
  const state = getState();
  const collection = findCollectionByUid(state.collections.collections, collectionUid);

  if (!collection) {
    return reject(new Error('Collection not found'));
  }

  const collectionCopy = cloneDeep(collection);
  const folder = findItemInCollection(collectionCopy, folderUid);

  if (folderUid && !folder) {
    return new Error('Folder not found');
  }

  const environment = findEnvironmentInCollection(collectionCopy, collection.activeEnvironmentUid);

  const globalEnvStore = globalEnvironmentStore.getState();
  const globalVariableList = globalEnvStore.environments.get(globalEnvStore.activeEnvironment)?.variables ?? [];
  const globalVariables = globalVariableList.reduce((acc, variable) => {
    if (variable.enabled) {
      acc[variable.name] = variable.value;
    }
    return acc;
  }, {});

  runnerStore.getState().initRun(collectionUid, {
    recursive,
    delay,
    path: folderUid
  });

  try {
    await ipcRenderer.invoke(
      'renderer:run-collection-folder',
      folder,
      collectionCopy,
      environment,
      globalVariables,
      recursive,
      delay
    );
  } catch (error) {
    runnerStore.getState().runEnded(collectionUid, String(error));
  }
};

export const newFolder = (folderName, collectionUid, itemUid) => (dispatch, getState) => {
  const state = getState();
  const collection = findCollectionByUid(state.collections.collections, collectionUid);

  return new Promise((resolve, reject) => {
    if (!collection) {
      return reject(new Error('Collection not found'));
    }

    if (!itemUid) {
      const folderWithSameNameExists = find(
        collection.items,
        (i) => i.type === 'folder' && trim(i.name) === trim(folderName)
      );
      if (!folderWithSameNameExists) {
        const fullName = `${collection.pathname}${PATH_SEPARATOR}${folderName}`;
        const { ipcRenderer } = window;

        ipcRenderer
          .invoke('renderer:new-folder', fullName)
          .then(() => resolve())
          .catch((error) => reject(error));
      } else {
        return reject(new Error('Duplicate folder names under same parent folder are not allowed'));
      }
    } else {
      const currentItem = findItemInCollection(collection, itemUid);
      if (currentItem) {
        const folderWithSameNameExists = find(
          currentItem.items,
          (i) => i.type === 'folder' && trim(i.name) === trim(folderName)
        );
        if (!folderWithSameNameExists) {
          const fullName = `${currentItem.pathname}${PATH_SEPARATOR}${folderName}`;
          const { ipcRenderer } = window;

          ipcRenderer
            .invoke('renderer:new-folder', fullName)
            .then(() => resolve())
            .catch((error) => reject(error));
        } else {
          return reject(new Error('Duplicate folder names under same parent folder are not allowed'));
        }
      } else {
        return reject(new Error('unable to find parent folder'));
      }
    }
  });
};

export const renameItem = (newName, itemUid, collectionUid) => async (_dispatch, getState) => {
  const state = getState();
  const collection = findCollectionByUid(state.collections.collections, collectionUid);

  if (!collection) {
    return reject(new Error('Collection not found'));
  }

  const item = findItemInCollection(collection, itemUid);
  if (!item) {
    return reject(new Error('Unable to locate item'));
  }

  await window.ipcRenderer.invoke('renderer:rename-item', item.pathname, newName);
};

export const cloneItem = (newName, itemUid, collectionUid) => (dispatch, getState) => {
  const state = getState();
  const collection = findCollectionByUid(state.collections.collections, collectionUid);

  return new Promise((resolve, reject) => {
    if (!collection) {
      throw new Error('Collection not found');
    }
    const collectionCopy = cloneDeep(collection);
    const item = findItemInCollection(collectionCopy, itemUid);
    if (!item) {
      throw new Error('Unable to locate item');
    }

    if (isItemAFolder(item)) {
      const parentFolder = findParentItemInCollection(collection, item.uid) || collection;

      const folderWithSameNameExists = find(
        parentFolder.items,
        (i) => i.type === 'folder' && trim(i.name) === trim(newName)
      );

      if (folderWithSameNameExists) {
        return reject(new Error('Duplicate folder names under same parent folder are not allowed'));
      }

      const collectionPath = `${parentFolder.pathname}${PATH_SEPARATOR}${newName}`;
      ipcRenderer.invoke('renderer:clone-folder', item, collectionPath).then(resolve).catch(reject);
      return;
    }

    const parentItem = findParentItemInCollection(collectionCopy, itemUid);
    const filename = resolveRequestFilename(newName);
    const itemToSave = refreshUidsInItem(transformRequestToSaveToFilesystem(item));
    itemToSave.name = trim(newName);
    if (!parentItem) {
      const reqWithSameNameExists = find(
        collection.items,
        (i) => i.type !== 'folder' && trim(i.filename) === trim(filename)
      );
      if (!reqWithSameNameExists) {
        const fullName = `${collection.pathname}${PATH_SEPARATOR}${filename}`;
        const { ipcRenderer } = window;
        const requestItems = filter(collection.items, (i) => i.type !== 'folder');
        itemToSave.seq = requestItems ? requestItems.length + 1 : 1;

        requestItemSchema
          .parseAsync(itemToSave)
          .then(() => ipcRenderer.invoke('renderer:new-request', collection.pathname, itemToSave))
          .then(resolve)
          .catch(reject);

        dispatch(
          insertTaskIntoQueue({
            uid: uuid(),
            type: 'OPEN_REQUEST',
            collectionUid,
            itemPathname: fullName
          })
        );
      } else {
        return reject(new Error('Duplicate request names are not allowed under the same folder'));
      }
    } else {
      const reqWithSameNameExists = find(
        parentItem.items,
        (i) => i.type !== 'folder' && trim(i.filename) === trim(filename)
      );
      if (!reqWithSameNameExists) {
        const pathname = getDirectoryName(item.pathname);
        const fullName = `${collection.pathname}${PATH_SEPARATOR}${filename}`;
        const { ipcRenderer } = window;
        const requestItems = filter(parentItem.items, (i) => i.type !== 'folder');
        itemToSave.seq = requestItems ? requestItems.length + 1 : 1;

        requestItemSchema
          .parseAsync(itemToSave)
          .then(() => ipcRenderer.invoke('renderer:new-request', pathname, itemToSave))
          .then(resolve)
          .catch(reject);

        dispatch(
          insertTaskIntoQueue({
            uid: uuid(),
            type: 'OPEN_REQUEST',
            collectionUid,
            itemPathname: fullName
          })
        );
      } else {
        return reject(new Error('Duplicate request names are not allowed under the same folder'));
      }
    }
  });
};

export const deleteItem = (itemUid, collectionUid) => (dispatch, getState) => {
  const state = getState();
  const collection = findCollectionByUid(state.collections.collections, collectionUid);

  return new Promise((resolve, reject) => {
    if (!collection) {
      return reject(new Error('Collection not found'));
    }

    const item = findItemInCollection(collection, itemUid);
    if (item) {
      const { ipcRenderer } = window;

      ipcRenderer.invoke('renderer:delete-item', item.pathname, item.type).then(resolve).catch(reject);
    }
    return;
  });
};

export const sortCollections = (payload) => (dispatch) => {
  dispatch(_sortCollections(payload));
};
export const filterCollections = (payload) => (dispatch) => {
  dispatch(_filterCollections(payload));
};

/**
 *
 * @param {string} collectionUid
 * @param {string} draggedItemUid
 * @param {string} targetItemUid
 * @param {"insert" | "below" | "above"} operation
 * @returns any
 */
export const moveItem = (collectionUid, draggedItemUid, targetItemUid, operation) => (dispatch, getState) => {
  const state = getState();
  const collection = findCollectionByUid(state.collections.collections, collectionUid);

  return new Promise((resolve, reject) => {
    if (!collection) {
      return reject(new Error('Collection not found'));
    }

    const collectionCopy = cloneDeep(collection);
    const draggedItem = findItemInCollection(collectionCopy, draggedItemUid);
    const targetItem = findItemInCollection(collectionCopy, targetItemUid);

    if (!draggedItem) {
      return reject(new Error('Dragged item not found'));
    }

    if (!targetItem) {
      return reject(new Error('Target item not found'));
    }

    // dragged/targetItemParent can be undefined, if the parent is the collection root
    const draggedItemParent = findParentItemInCollection(collectionCopy, draggedItemUid);
    const targetItemParent = findParentItemInCollection(collectionCopy, targetItemUid);
    const sameParent = draggedItemParent === targetItemParent;

    // Item was moved next to an item in the same folder
    if (operation !== 'insert' && sameParent) {
      moveCollectionItem(collectionCopy, draggedItem, targetItem, operation);
      const itemsToResequence = getItemsToResequence(draggedItemParent, collectionCopy);

      return ipcRenderer
        .invoke('renderer:resequence-items', itemsToResequence)
        .then(resolve)
        .catch((error) => reject(error));
    }

    // Item was moved next to an item in a different folder
    if (operation !== 'insert') {
      const draggedItemPathname = draggedItem.pathname;
      // Folder dragged into its own child folder. This will cause an error
      if (isItemAFolder(draggedItem) && targetItem.pathname.startsWith(draggedItemPathname)) {
        toast.error('Cannot move folder into a child of its own');
        return;
      }

      moveCollectionItem(collectionCopy, draggedItem, targetItem, operation);
      const itemsToResequence = getItemsToResequence(draggedItemParent, collectionCopy);
      const itemsToResequence2 = getItemsToResequence(targetItemParent, collectionCopy);

      const type = isItemARequest(draggedItem) ? 'file' : 'folder';
      const targetPathname = targetItemParent ? targetItemParent.pathname : collectionCopy.pathname;
      return ipcRenderer
        .invoke(`renderer:move-${type}-item`, draggedItemPathname, targetPathname)
        .then(() =>
          Promise.all([
            ipcRenderer.invoke('renderer:resequence-items', itemsToResequence),
            ipcRenderer.invoke('renderer:resequence-items', itemsToResequence2)
          ])
        )
        .then(resolve)
        .catch((error) => reject(error));
    }

    // Operation is now always "insert". So an Item was dragged into a folder

    const draggedItemPathname = draggedItem.pathname;
    // Check if folder dragged into its own child folder
    if (isItemAFolder(draggedItem) && targetItem.pathname.startsWith(draggedItemPathname)) {
      toast.error('Cannot move folder into a child of its own');
      return;
    }

    // Check if Item was dragged into its now parent.
    if (draggedItemParent === targetItem) {
      toast.error('Item is already in the folder');
      return;
    }

    moveCollectionItem(collectionCopy, draggedItem, targetItem, operation);
    const itemsToResequence = getItemsToResequence(draggedItemParent, collectionCopy);
    const itemsToResequence2 = getItemsToResequence(targetItem, collectionCopy);

    const type = isItemARequest(draggedItem) ? 'file' : 'folder';
    const targetPathname = targetItem ? targetItem.pathname : collectionCopy.pathname;
    return ipcRenderer
      .invoke(`renderer:move-${type}-item`, draggedItemPathname, targetPathname)
      .then(() =>
        Promise.all([
          ipcRenderer.invoke('renderer:resequence-items', itemsToResequence),
          ipcRenderer.invoke('renderer:resequence-items', itemsToResequence2)
        ])
      )
      .then(resolve)
      .catch((error) => reject(error));
  });
};

export const moveItemToRootOfCollection = (collectionUid, draggedItemUid) => (dispatch, getState) => {
  const state = getState();
  const collection = findCollectionByUid(state.collections.collections, collectionUid);

  return new Promise((resolve, reject) => {
    if (!collection) {
      return reject(new Error('Collection not found'));
    }

    const collectionCopy = cloneDeep(collection);
    const draggedItem = findItemInCollection(collectionCopy, draggedItemUid);
    if (!draggedItem) {
      return reject(new Error('Dragged item not found'));
    }

    const draggedItemParent = findParentItemInCollection(collectionCopy, draggedItemUid);
    // file item is already at the root level
    if (!draggedItemParent) {
      return resolve();
    }

    const draggedItemPathname = draggedItem.pathname;
    moveCollectionItemToRootOfCollection(collectionCopy, draggedItem);

    if (isItemAFolder(draggedItem)) {
      return ipcRenderer
        .invoke('renderer:move-folder-item', draggedItemPathname, collectionCopy.pathname)
        .then(resolve)
        .catch((error) => reject(error));
    } else {
      const itemsToResequence = getItemsToResequence(draggedItemParent, collectionCopy);
      const itemsToResequence2 = getItemsToResequence(collectionCopy, collectionCopy);

      return ipcRenderer
        .invoke('renderer:move-file-item', draggedItemPathname, collectionCopy.pathname)
        .then(() => ipcRenderer.invoke('renderer:resequence-items', itemsToResequence))
        .then(() => ipcRenderer.invoke('renderer:resequence-items', itemsToResequence2))
        .then(resolve)
        .catch((error) => reject(error));
    }
  });
};

export const changeCollectionOrder = (sourceCollectionUid, targetCollectionUid) => async (dispatch, getState) => {
  const sortOrder = getState().collections.collectionSortOrder;
  if (sortOrder !== 'default') {
    return;
  }

  dispatch(changeCollectionCustomOrder({ sourceCollectionUid, targetCollectionUid }));

  const collections = getState().collections.collections;
  const sourceCollectionPath = collections.find((collection) => collection.uid === sourceCollectionUid).pathname;
  const targetCollectionPath = collections.find((collection) => collection.uid === targetCollectionUid).pathname;

  await window.ipcRenderer.invoke('renderer:change-collection-path-order', sourceCollectionPath, targetCollectionPath);
};

export const newHttpRequest = (params) => (dispatch, getState) => {
  const { requestName, requestType, requestUrl, requestMethod, collectionUid, itemUid, headers, body, auth } = params;

  return new Promise(async (resolve, reject) => {
    const state = getState();
    const collection = findCollectionByUid(state.collections.collections, collectionUid);
    if (!collection) {
      return reject(new Error('Collection not found'));
    }

    const parts = splitOnFirst(requestUrl, '?');
    const queryParams = parseQueryParams(parts[1]);
    each(queryParams, (urlParam) => {
      urlParam.enabled = true;
      urlParam.type = 'query';
    });

    const pathParams = parsePathParams(requestUrl);
    each(pathParams, (pathParm) => {
      pathParams.enabled = true;
      pathParm.type = 'path';
    });

    const params = [...queryParams, ...pathParams];

    const item = {
      uid: uuid(),
      type: requestType,
      name: requestName,
      request: {
        method: requestMethod,
        url: requestUrl,
        headers: headers ?? [],
        params,
        body: body ?? {
          mode: 'none',
          json: null,
          text: null,
          xml: null,
          sparql: null,
          multipartForm: null,
          formUrlEncoded: null
        },
        auth: auth ?? {
          mode: 'inherit'
        }
      }
    };

    // itemUid is null when we are creating a new request at the root level
    const filename = resolveRequestFilename(requestName);
    if (!itemUid) {
      const reqWithSameNameExists = find(
        collection.items,
        (i) => i.type !== 'folder' && trim(i.filename) === trim(filename)
      );
      const requestItems = filter(collection.items, (i) => i.type !== 'folder');
      item.seq = requestItems.length + 1;

      if (!reqWithSameNameExists) {
        const { ipcRenderer } = window;

        const newPath = await ipcRenderer.invoke('renderer:new-request', collection.pathname, item);
        // the useCollectionNextAction() will track this and open the new request in a new tab
        // once the request is created
        dispatch(
          insertTaskIntoQueue({
            uid: uuid(),
            type: 'OPEN_REQUEST',
            collectionUid,
            itemPathname: newPath
          })
        );

        resolve();
      } else {
        return reject(new Error('Duplicate request names are not allowed under the same folder'));
      }
    } else {
      const currentItem = findItemInCollection(collection, itemUid);
      if (currentItem) {
        const reqWithSameNameExists = find(
          currentItem.items,
          (i) => i.type !== 'folder' && trim(i.filename) === trim(filename)
        );
        const requestItems = filter(currentItem.items, (i) => i.type !== 'folder');
        item.seq = requestItems.length + 1;
        if (!reqWithSameNameExists) {
          const { ipcRenderer } = window;

          const newPath = await ipcRenderer.invoke('renderer:new-request', currentItem.pathname, item);

          // the useCollectionNextAction() will track this and open the new request in a new tab
          // once the request is created
          dispatch(
            insertTaskIntoQueue({
              uid: uuid(),
              type: 'OPEN_REQUEST',
              collectionUid,
              itemPathname: newPath
            })
          );

          resolve();
        } else {
          return reject(new Error('Duplicate request names are not allowed under the same folder'));
        }
      }
    }
  });
};

export const addEnvironment = (name, collectionUid) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const state = getState();
    const collection = findCollectionByUid(state.collections.collections, collectionUid);
    if (!collection) {
      return reject(new Error('Collection not found'));
    }

    ipcRenderer
      .invoke('renderer:create-environment', collection.pathname, name)
      .then(
        dispatch(
          updateLastAction({
            collectionUid,
            lastAction: {
              type: 'ADD_ENVIRONMENT',
              payload: name
            }
          })
        )
      )
      .then(resolve)
      .catch(reject);
  });
};

export const importEnvironment = (name, variables, collectionUid) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const state = getState();
    const collection = findCollectionByUid(state.collections.collections, collectionUid);
    if (!collection) {
      return reject(new Error('Collection not found'));
    }

    ipcRenderer
      .invoke('renderer:create-environment', collection.pathname, name, variables)
      .then(
        dispatch(
          updateLastAction({
            collectionUid,
            lastAction: {
              type: 'ADD_ENVIRONMENT',
              payload: name
            }
          })
        )
      )
      .then(resolve)
      .catch(reject);
  });
};

export const copyEnvironment = (name, baseEnvUid, collectionUid) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const state = getState();
    const collection = findCollectionByUid(state.collections.collections, collectionUid);
    if (!collection) {
      return reject(new Error('Collection not found'));
    }

    const baseEnv = findEnvironmentInCollection(collection, baseEnvUid);
    if (!collection) {
      return reject(new Error('Environmnent not found'));
    }

    ipcRenderer
      .invoke('renderer:create-environment', collection.pathname, name, baseEnv.variables)
      .then(
        dispatch(
          updateLastAction({
            collectionUid,
            lastAction: {
              type: 'ADD_ENVIRONMENT',
              payload: name
            }
          })
        )
      )
      .then(resolve)
      .catch(reject);
  });
};

export const renameEnvironment = (newName, environmentUid, collectionUid) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const state = getState();
    const collection = findCollectionByUid(state.collections.collections, collectionUid);
    if (!collection) {
      return reject(new Error('Collection not found'));
    }

    const collectionCopy = cloneDeep(collection);
    const environment = findEnvironmentInCollection(collectionCopy, environmentUid);
    if (!environment) {
      return reject(new Error('Environment not found'));
    }

    const oldName = environment.name;
    environment.name = newName;

    environmentSchema
      .parseAsync(environment)
      .then(() => ipcRenderer.invoke('renderer:rename-environment', collection.pathname, oldName, newName))
      .then(() => {
        // This will automaticly reselect the renamed environment
        if (environmentUid === collection.activeEnvironmentUid) {
          dispatch(
            updateLastAction({
              collectionUid,
              lastAction: {
                type: 'ADD_ENVIRONMENT',
                payload: newName
              }
            })
          );
        }
        resolve();
      })
      .catch(reject);
  });
};

export const deleteEnvironment = (environmentUid, collectionUid) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const state = getState();
    const collection = findCollectionByUid(state.collections.collections, collectionUid);
    if (!collection) {
      return reject(new Error('Collection not found'));
    }

    const collectionCopy = cloneDeep(collection);

    const environment = findEnvironmentInCollection(collectionCopy, environmentUid);
    if (!environment) {
      return reject(new Error('Environment not found'));
    }

    ipcRenderer
      .invoke('renderer:delete-environment', collection.pathname, environment.name)
      .then(resolve)
      .catch(reject);
  });
};

export const saveEnvironment = (variables, environmentUid, collectionUid) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const state = getState();
    const collection = findCollectionByUid(state.collections.collections, collectionUid);
    if (!collection) {
      return reject(new Error('Collection not found'));
    }

    const collectionCopy = cloneDeep(collection);
    const environment = findEnvironmentInCollection(collectionCopy, environmentUid);
    if (!environment) {
      return reject(new Error('Environment not found'));
    }

    environment.variables = variables;

    environmentSchema
      .parseAsync(environment)
      .then(() => ipcRenderer.invoke('renderer:save-environment', collection.pathname, environment))
      .then(resolve)
      .catch(reject);
  });
};

export const selectEnvironment = (environmentUid, collectionUid) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const state = getState();
    const collection = findCollectionByUid(state.collections.collections, collectionUid);
    if (!collection) {
      return reject(new Error('Collection not found'));
    }

    const collectionCopy = cloneDeep(collection);
    if (environmentUid) {
      const environment = findEnvironmentInCollection(collectionCopy, environmentUid);
      if (!environment) {
        return reject(new Error('Environment not found'));
      }
    }

    dispatch(_selectEnvironment({ environmentUid, collectionUid }));
    resolve();
  });
};

export const removeCollection = (collectionUid) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const state = getState();
    const collection = findCollectionByUid(state.collections.collections, collectionUid);
    if (!collection) {
      return reject(new Error('Collection not found'));
    }
    const { ipcRenderer } = window;
    ipcRenderer
      .invoke('renderer:remove-collection', collection.pathname)
      .then(() => {
        dispatch(closeAllCollectionTabs({ collectionUid }));
      })
      .then(waitForNextTick)
      .then(() => {
        dispatch(
          _removeCollection({
            collectionUid: collectionUid
          })
        );
      })
      .then(resolve)
      .catch(reject);
  });
};

export const browseDirectory = () => (dispatch, getState) => {
  const { ipcRenderer } = window;

  return new Promise((resolve, reject) => {
    ipcRenderer.invoke('renderer:browse-directory').then(resolve).catch(reject);
  });
};

export const browseFiles =
  (filters = []) =>
  (dispatch, getState) => {
    const { ipcRenderer } = window;

    return new Promise((resolve, reject) => {
      ipcRenderer.invoke('renderer:browse-files', filters).then(resolve).catch(reject);
    });
  };

export const updateBrunoConfig = (brunoConfig, collectionUid) => (dispatch, getState) => {
  const state = getState();

  const collection = findCollectionByUid(state.collections.collections, collectionUid);
  if (!collection) {
    return reject(new Error('Collection not found'));
  }

  return new Promise((resolve, reject) => {
    ipcRenderer
      .invoke('renderer:update-bruno-config', brunoConfig, collection.pathname, collectionUid)
      .then(resolve)
      .catch(reject);
  });
};

export const openCollectionEvent = (uid, pathname, brunoConfig) => (dispatch, getState) => {
  const collection = {
    version: '1',
    uid: uid,
    name: brunoConfig.name,
    pathname: pathname,
    items: [],
    runtimeVariables: {},
    environments: [],
    brunoConfig: brunoConfig,
    activeEnvironmentUid: null
  };

  return new Promise((resolve, reject) => {
    collectionSchema
      .parseAsync(collection)
      .then((parsedCollection) => dispatch(_createCollection(parsedCollection)))
      .then(resolve)
      .catch(reject);
  });
};

export const createCollection = (collectionName, collectionFolderName, collectionLocation) => () => {
  const { ipcRenderer } = window;

  return new Promise((resolve, reject) => {
    ipcRenderer
      .invoke('renderer:create-collection', collectionName, collectionFolderName, collectionLocation)
      .then(resolve)
      .catch(reject);
  });
};
export const cloneCollection = (collectionName, collectionFolderName, collectionLocation, perviousPath) => () => {
  const { ipcRenderer } = window;

  return ipcRenderer.invoke(
    'renderer:clone-collection',
    collectionName,
    collectionFolderName,
    collectionLocation,
    perviousPath
  );
};
export const openCollection = () => () => {
  return new Promise((resolve, reject) => {
    const { ipcRenderer } = window;

    ipcRenderer.invoke('renderer:open-collection').then(resolve).catch(reject);
  });
};

export const collectionAddEnvFileEvent = (payload) => (dispatch, getState) => {
  const { data: environment, meta } = payload;

  return new Promise((resolve, reject) => {
    const state = getState();
    const collection = findCollectionByUid(state.collections.collections, meta.collectionUid);
    if (!collection) {
      return reject(new Error('Collection not found'));
    }

    environmentSchema
      .parseAsync(environment)
      .then(() =>
        dispatch(
          _collectionAddEnvFileEvent({
            environment,
            collectionUid: meta.collectionUid
          })
        )
      )
      .then(resolve)
      .catch(reject);
  });
};

export const importCollection = (collection, collectionLocation) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const { ipcRenderer } = window;
    ipcRenderer.invoke('renderer:import-collection', collection, collectionLocation).then(resolve).catch(reject);
  });
};

export const shellOpenCollectionPath = (itemPath, isCollection, edit) => () => {
  return new Promise((resolve, reject) => {
    const { ipcRenderer } = window;
    ipcRenderer.invoke('renderer:shell-open', itemPath, isCollection, edit).then(resolve).catch(reject);
  });
};
