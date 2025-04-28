/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { CollectionSchema } from '@usebruno/schema';

export function sortCollections(
  collections: CollectionSchema[],
  collectionSortOrder: 'default' | 'alphabetical' | 'reverseAlphabetical',
  collectionCustomOrder: string[]
): CollectionSchema[] {
  switch (collectionSortOrder) {
    case 'alphabetical':
      return collections.toSorted((a, b) => a.name.localeCompare(b.name));
    case 'reverseAlphabetical':
      return collections.toSorted((a, b) => a.name.localeCompare(b.name)).reverse();
    case 'default':
      const sortedCollections = [];
      for (const collectionUid of collectionCustomOrder) {
        const collection = collections.find((collection) => collection.uid === collectionUid);
        if (collection) {
          sortedCollections.push(collection);
        }
      }
      return sortedCollections;
  }
}
