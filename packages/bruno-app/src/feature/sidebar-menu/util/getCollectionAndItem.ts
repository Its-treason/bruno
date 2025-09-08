/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { CollectionInfo, collectionStore, ItemInfo } from 'src/store/collectionStore';

export function getCollectionAndItem(collectionUid: string): [CollectionInfo, undefined];
export function getCollectionAndItem(collectionUid: string, itemId: string): [CollectionInfo, ItemInfo];
export function getCollectionAndItem(collectionUid: string, itemId?: string): [CollectionInfo, ItemInfo | undefined];
export function getCollectionAndItem(collectionId: string, itemId?: string): [CollectionInfo, ItemInfo | undefined] {
  const state = collectionStore.getState();

  const collection = state.collections.get(collectionId);
  if (!collection) {
    throw new Error(`No collection with id ${collectionId} found`);
  }

  if (itemId) {
    const item = state.items.get(itemId);
    if (!item) {
      throw new Error(`No item with id: "${itemId}" found`);
    }
    return [collection, item];
  }

  return [collection, undefined];
}
