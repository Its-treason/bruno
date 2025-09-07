/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import type { ParsedFile } from '@usebruno/core';
import {
  BrunoConfigSchema,
  CollectionMetadataSchema,
  DirMetaSchema,
  EnvironmentSchema,
  FileMetaSchema,
  RequestSchema
} from '@usebruno/schema';
import { isDraft, original, produce, WritableDraft } from 'immer';
import { createStore, useStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

//#region Types
export type CollectionInfo = {
  id: string;
  dirMeta: DirMetaSchema;

  config?: BrunoConfigSchema;
  data?: CollectionMetadataSchema;

  initialLoaded: boolean;
  openedDate: number;
  loadFinishedDate?: number;

  children: Set<string>;
  processEnvVariables: Record<string, string>;

  activeEnvironmentId?: string;
  environments: Map<string, EnvironmentSchema>;
};

export type ItemInfo = {
  id: string;
  // If the parentId is undefined, the item is in the root of the collection
  parentId?: string;
} & (
  | {
      type: 'request';
      meta: FileMetaSchema;
      data: RequestSchema;
    }
  | {
      type: 'dir';
      meta: DirMetaSchema;
      data?: CollectionMetadataSchema;
      children: Set<string>;
    }
);

type Actions = {
  collectionLoadStarted: (collectionId: string, dirMeta: DirMetaSchema) => void;
  collectionLoadFinished: (collectionId: string, parsedFile: ParsedFile[]) => void;

  collectionItemChanged: (collectionId: string, parsedFile: ParsedFile) => void;

  updateRequestItem: (itemId: string, updateCallback: (draft: WritableDraft<RequestSchema>) => void) => void;
  updateDirMeta: (itemId: string, updateCallback: (draft: WritableDraft<CollectionMetadataSchema>) => void) => void;
  deleteItemDraft: (itemId: string) => void;
};

type CollectionStore = {
  collections: Map<string, CollectionInfo>;
  items: Map<string, ItemInfo>;
  draftItems: Map<string, ItemInfo>;
};
//#endRegion

//#region Store
export const collectionStore = createStore(
  immer<CollectionStore & Actions>((set) => ({
    collections: new Map(),
    items: new Map(),
    draftItems: new Map(),

    collectionLoadStarted: (collectionId: string, dirMeta: DirMetaSchema) => {
      set((state) => {
        if (state.collections.has(collectionId)) {
          throw new Error('Collection already opened!');
        }

        state.collections.set(collectionId, {
          children: new Set(),
          dirMeta,
          id: collectionId,
          initialLoaded: false,
          openedDate: Date.now(),
          processEnvVariables: {},
          environments: new Map()
        });
      });
    },
    collectionLoadFinished: (collectionId: string, parsedFile: ParsedFile[]) => {
      set((state) => {
        if (!state.collections.has(collectionId)) {
          throw new Error(`Collection with Id: "${collectionId}" does not exists!`);
        }

        const collection = state.collections.get(collectionId);
        collection.initialLoaded = true;
        collection.loadFinishedDate = Date.now();
      });
    },

    collectionItemChanged: (collectionId: string, parsedFile: ParsedFile) => {
      set((state) => {
        if (!state.collections.has(collectionId)) {
          throw new Error(`Collection with Id: "${collectionId}" does not exists!`);
        }

        const collection = state.collections.get(collectionId);

        switch (parsedFile.type) {
          case 'brunoJson':
            collection.config = parsedFile.data;
            break;
          case 'collectionMeta':
            if (shouldUpdateContent(collection.data, parsedFile.data)) {
              collection.data = parsedFile.data;
            }
            break;
          case 'dir':
          case 'dirMeta':
            const existingDir = state.items.get(parsedFile.id);
            if (!existingDir) {
              state.items.set(parsedFile.id, {
                type: 'dir',
                children: new Set(),
                id: parsedFile.id,
                meta: parsedFile.meta,
                data: parsedFile.type === 'dirMeta' ? parsedFile.data : null,
                parentId: parsedFile.parentId
              });
              ensureParentExists(state, collection, parsedFile.id, parsedFile.parentId);
              break;
            }

            updateParentRelationship(state, collection, parsedFile.id, parsedFile.parentId);
            existingDir.meta = parsedFile.meta;
            if (parsedFile.type === 'dirMeta' && shouldUpdateContent(parsedFile.data, existingDir.data)) {
              existingDir.data = parsedFile.data;
            }
            break;
          case 'request':
            console.log(parsedFile);
            const existingItem = state.items.get(parsedFile.id);
            if (!existingItem) {
              state.items.set(parsedFile.id, {
                type: 'request',
                id: parsedFile.id,
                meta: parsedFile.meta,
                data: parsedFile.data,
                parentId: parsedFile.parentId
              });
              ensureParentExists(state, collection, parsedFile.id, parsedFile.parentId);
              break;
            }

            updateParentRelationship(state, collection, parsedFile.id, parsedFile.parentId);
            existingItem.meta = parsedFile.meta;
            if (shouldUpdateContent(parsedFile.data, existingItem.data)) {
              existingItem.data = parsedFile.data;
            }
            break;
          case 'envFile':
            const environment = collection.environments.get(parsedFile.data.id);
            if (!environment || environment.contentHash !== parsedFile.data.contentHash) {
              collection.environments.set(parsedFile.data.id, parsedFile.data);
            }
            break;
          case 'parsingError':
            console.error('Parsing of file failed!', parsedFile);
          case 'delete':
            state.items.delete(parsedFile.id);
            state.draftItems.delete(parsedFile.id);

            if (parsedFile.parentId) {
              const parent = state.items.get(parsedFile.parentId);
              if (parent.type !== 'dir') {
                break;
              }
              parent.children.delete(parsedFile.id);
            } else {
              collection.children.delete(parsedFile.id);
            }
        }
      });
    },

    updateRequestItem: (itemId: string, updateCallback: (draft: WritableDraft<RequestSchema>) => void) => {
      set((state) => {
        const draftItem = getWriteableDraft(state, itemId);
        if (draftItem.type !== 'request') {
          throw new Error('Expected Item to be a request');
        }

        draftItem.data = produce(draftItem.data, updateCallback);
        state.draftItems.set(itemId, draftItem);
      });
    },
    updateDirMeta: (itemId: string, updateCallback: (draft: WritableDraft<CollectionMetadataSchema>) => void) => {
      set((state) => {
        const draftItem = getWriteableDraft(state, itemId);
        if (draftItem.type !== 'dir') {
          throw new Error('Expected Item to be a dir');
        }

        draftItem.data = produce(draftItem.data, updateCallback);
        state.draftItems.set(itemId, draftItem);
      });
    },
    deleteItemDraft: (itemId: string) => {
      set((state) => {
        state.draftItems.delete(itemId);
      });
    }
  }))
);
//#endRegion

//#region IPC Listener
// Collection was opened. We get first Infos of the collection to show in UI
window.ipcRenderer.on('collection:load-started', (collectionId: string, dirMeta: DirMetaSchema) => {
  collectionStore.getState().collectionLoadStarted(collectionId, dirMeta);
});

// All collection items have been parsed
window.ipcRenderer.on('collection:load-finished', (collectionId: string, parsedFiles: ParsedFile[]) => {
  const state = collectionStore.getState();

  for (const file of parsedFiles) {
    try {
      state.collectionItemChanged(collectionId, file);
    } catch (error) {
      console.error('collectionItemChanged', error);
    }
  }

  state.collectionLoadFinished(collectionId, parsedFiles);
});

window.ipcRenderer.on('collection:items-updated', (collectionId: string, parsedFiles: ParsedFile[]) => {
  const state = collectionStore.getState();

  for (const file of parsedFiles) {
    try {
      state.collectionItemChanged(collectionId, file);
    } catch (error) {
      console.error('collectionItemChanged', error);
    }
  }
});
//#endRegion

//#region Store hooks
export const useRequestItem = (itemId: string) => {
  const item = useStore(collectionStore, (state) => state.draftItems.get(itemId) || state.items.get(itemId));
  if (item.type !== 'request') {
    throw new Error('Expected Item to be of type request');
  }
  return item;
};

export const useDirItem = (itemId: string) => {
  const item = useStore(collectionStore, (state) => state.draftItems.get(itemId) || state.items.get(itemId));
  if (item.type !== 'dir') {
    throw new Error('Expected Item to be of type dir');
  }
  return item;
};
//#endRegion

//#region Utility functions
const updateParentRelationship = (
  state: CollectionStore,
  collection: CollectionInfo,
  itemId: string,
  newParentId?: string
) => {
  const item = state.items.get(itemId);
  if (!item || item.parentId === newParentId) {
    return;
  }

  // Remove from old parent. When item.parentId is null the parent will be the collection
  if (item.parentId) {
    const oldParent = state.items.get(item.parentId);
    if (oldParent?.type === 'dir') {
      oldParent.children.delete(itemId);
    }
  } else {
    collection.children.delete(itemId);
  }

  // Add to new parent. When item.parentId is null the parent will be the collection
  if (newParentId) {
    const newParent = state.items.get(newParentId);
    if (newParent?.type === 'dir') {
      newParent.children.add(itemId);
    }
  } else {
    collection.children.add(itemId);
  }

  item.parentId = newParentId;
};

const ensureParentExists = (state: CollectionStore, collection: CollectionInfo, itemId: string, parentId?: string) => {
  if (!parentId) {
    collection.children.add(itemId);
    return;
  }

  let parent = state.items.get(parentId);
  if (!parent) {
    parent = {
      id: parentId,
      type: 'dir',
      children: new Set([itemId]),
      meta: { basename: '', dirname: '', path: '' }
    };
    state.items.set(parentId, parent);
  } else if (parent.type === 'dir') {
    parent.children.add(itemId);
  }
};

const shouldUpdateContent = (existing?: ItemInfo['data'], incoming?: ItemInfo['data']) => {
  return !existing || !incoming || existing.contentHash !== incoming.contentHash;
};

const getWriteableDraft = (state: CollectionStore, itemId: string) => {
  let draftItem = state.draftItems.get(itemId);
  if (!draftItem) {
    draftItem = state.items.get(itemId);
    if (!draftItem) {
      throw new Error(`Item not found ${itemId}`);
    }

    // Ensure we create a fresh copy for the draft
    if (isDraft(draftItem)) {
      draftItem = original(draftItem);
    }
    draftItem = structuredClone(draftItem);
  }
  return draftItem;
};
//#endRegion
