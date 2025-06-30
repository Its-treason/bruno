import type { ParsedFile } from '@usebruno/core';
import {
  BrunoConfigSchema,
  CollectionMetadataSchema,
  DirMetaSchema,
  FileMetaSchema,
  RequestSchema
} from '@usebruno/schema';
import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

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

  collectionItemsChanged: (collectionId: string, parsedFile: ParsedFile) => void;
};

type CollectionStore = {
  collections: Map<string, CollectionInfo>;
  items: Map<string, ItemInfo>;
};

export const collectionStore = createStore(
  immer<CollectionStore & Actions>((set) => ({
    collections: new Map(),
    items: new Map(),

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
          processEnvVariables: {}
        });
      });
    },
    collectionLoadFinished: (collectionId: string, parsedFile: ParsedFile[]) => {
      set((state) => {
        if (!state.collections.has(collectionId)) {
          throw new Error(`Collection with Id: "${collectionId}" does not exists!`);
        }

        for (const file of parsedFile) {
          state.collectionItemsChanged(collectionId, file);
        }

        const collection = state.collections.get(collectionId);
        collection.initialLoaded = true;
        collection.loadFinishedDate = Date.now();
      });
    },

    collectionItemsChanged: (collectionId: string, parsedFile: ParsedFile) => {
      set((state) => {
        if (!state.collections.has(collectionId)) {
          throw new Error(`Collection with Id: "${collectionId}" does not exists!`);
        }

        const collection = state.collections.get(collectionId);

        const fixParentId = (id: string, newParentId?: string) => {
          const item = state.items.get(id);
          if (!item || !item.parentId || item.parentId === newParentId) {
            return;
          }

          const oldParentItem = state.items.get(item.parentId!);
          if (oldParentItem.type === 'dir') {
            oldParentItem.children.delete(id);
          }

          const newParentItem = state.items.get(newParentId);
          if (newParentItem.type === 'dir') {
            newParentItem.children.add(id);
          }
        };

        const ensureParentExists = (id: string, parentId?: string) => {
          if (parentId === null) {
            collection.children.add(id);
            return;
          }

          const newParentItem = state.items.get(parentId);
          if (newParentItem === null) {
            state.items.set(parentId, {
              id: parentId,
              type: 'dir',
              children: new Set().add(id) as Set<string>,
              meta: {
                basename: '',
                dirname: '',
                path: ''
              }
            });
            return;
          }

          if (newParentItem.type === 'dir') {
            newParentItem.children.add(id);
          }
        };

        switch (parsedFile.type) {
          case 'brunoJson':
            collection.config = parsedFile.data;
            break;
          case 'collectionMeta':
            if (collection.data?.contentHash !== parsedFile.data.contentHash) {
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
              ensureParentExists(parsedFile.id, parsedFile.parentId);
              break;
            }

            fixParentId(parsedFile.id, parsedFile.parentId);
            existingDir.meta = parsedFile.meta;
            if (parsedFile.type === 'dirMeta') {
              if (parsedFile.data.contentHash !== existingDir.data?.contentHash) {
                existingDir.data = parsedFile.data;
              }
            }
            break;
          case 'request':
            const existingItem = state.items.get(parsedFile.id);
            if (!existingItem) {
              state.items.set(parsedFile.id, {
                type: 'request',
                id: parsedFile.id,
                meta: parsedFile.meta,
                data: parsedFile.data,
                parentId: parsedFile.parentId
              });
              ensureParentExists(parsedFile.id, parsedFile.parentId);
              break;
            }

            fixParentId(parsedFile.id, parsedFile.parentId);
            existingItem.meta = parsedFile.meta;
            if (parsedFile.data.contentHash !== existingItem.data?.contentHash) {
              existingItem.data = parsedFile.data;
            }
            break;
          case 'envFile':
          //
          case 'parsingError':
        }
      });
    }
  }))
);

// Collection was opened. We get first Infos of the collection to show in UI
window.ipcRenderer.on('collection:load-started', (collectionId: string, dirMeta: DirMetaSchema) => {
  collectionStore.getState().collectionLoadStarted(collectionId, dirMeta);
});

// All collection items have been parsed
window.ipcRenderer.on('collection:load-finished', (collectionId: string, parsedFiles: ParsedFile[]) => {
  collectionStore.getState().collectionLoadFinished(collectionId, parsedFiles);
});
