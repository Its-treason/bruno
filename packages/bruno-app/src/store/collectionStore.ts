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

type Actions = {
  collectionLoadStarted: (collectionId: string) => void;
  collectionItemChanged: (collectionId: string, parsedFile: ParsedFile) => void;
};

export type CollectionInfo = {
  id: string;
  config?: BrunoConfigSchema;
  data?: CollectionMetadataSchema;

  initialLoaded: boolean;
  initialParsingTime: number;

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
    }
);

type CollectionStore = {
  collections: Map<string, CollectionInfo>;
  items: Map<string, ItemInfo>;
};

export const runnerStore = createStore(
  immer<CollectionStore & Actions>((set) => ({
    collections: new Map(),
    items: new Map(),

    collectionLoadStarted: (collectionId: string) => {},
    collectionItemChanged: (collectionId: string, parsedFile: ParsedFile) => {}
  }))
);

window.ipcRenderer.on(
  'collection:load-started',
  (collectionId: string, parsedFiles: ParsedFile[], parseTime: number) => {}
);

window.ipcRenderer.on(
  'collection:items-initial-loaded',
  (collectionId: string, parsedFiles: ParsedFile[], parseTime: number) => {}
);
