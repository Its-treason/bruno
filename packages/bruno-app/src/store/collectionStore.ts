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

  children: unknown[];
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
  collectionLoadFinished: (collectionId: string, parsedFile: ParsedFile) => void;

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
          children: [],
          dirMeta,
          id: collectionId,
          initialLoaded: false,
          openedDate: Date.now()
        });
      });
    },
    collectionLoadFinished: (collectionId: string, parsedFile: ParsedFile) => {
      set((state) => {
        if (!state.collections.has(collectionId)) {
          throw new Error(`Collection with Id: "${collectionId}" does not exists!`);
        }

        state.collectionItemsChanged(collectionId, parsedFile);

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
            // oldParentItem.
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
          case 'dir':
        }
      });
    }
  }))
);

// Collection was opened. We get first Infos of the collection to show in UI
window.ipcRenderer.on('collection:load-started', (collectionId: string, dirMeta: DirMetaSchema) => {
  collectionStore.getState().collectionLoadStarted();
});

// All collection items have been parsed
window.ipcRenderer.on('collection:load-finished', (collectionId: string, parsedFiles: ParsedFile[]) => {});
