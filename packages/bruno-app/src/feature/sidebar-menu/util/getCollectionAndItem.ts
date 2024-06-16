/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { findCollectionByUid, findItemInCollection } from 'utils/collections';

export function getCollectionAndItem(
  collections: CollectionSchema[],
  collectionUid: string
): [CollectionSchema, undefined];
export function getCollectionAndItem(
  collections: CollectionSchema[],
  collectionUid: string,
  itemUid: string
): [CollectionSchema, RequestItemSchema];
export function getCollectionAndItem(
  collections: CollectionSchema[],
  collectionUid: string,
  itemUid?: string
): [CollectionSchema, RequestItemSchema | undefined];
export function getCollectionAndItem(
  collections: CollectionSchema[],
  collectionUid: string,
  itemUid?: string
): [CollectionSchema, RequestItemSchema | undefined] {
  const collection = findCollectionByUid(collections, collectionUid);
  if (!collection) {
    throw new Error(`No collection with id ${collectionUid} found`);
  }

  if (itemUid) {
    const item = findItemInCollection(collection, itemUid);
    if (!item) {
      throw new Error(`No item with id ${itemUid} in ${collection.name} found!`);
    }
    return [collection, item];
  }

  return [collection, undefined];
}
