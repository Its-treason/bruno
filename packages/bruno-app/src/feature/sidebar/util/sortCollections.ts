/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { CollectionInfo } from 'src/store/collectionStore';

export function sortCollections(
  collections: CollectionInfo[],
  collectionSortOrder: 'default' | 'asc' | 'desc',
  collectionCustomOrder: string[]
): CollectionInfo[] {
  switch (collectionSortOrder) {
    case 'asc':
      return collections.toSorted((a, b) => a.config.name.localeCompare(b.config.name));
    case 'desc':
      return collections.toSorted((a, b) => a.config.name.localeCompare(b.config.name)).reverse();
    case 'default':
      const sortedCollections = [];
      for (const collectionUid of collectionCustomOrder) {
        const collection = collections.find((collection) => collection.id === collectionUid);
        if (collection) {
          sortedCollections.push(collection);
        }
      }
      return sortedCollections;
  }
}
