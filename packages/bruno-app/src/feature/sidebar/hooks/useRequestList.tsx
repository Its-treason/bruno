/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useSelector } from 'react-redux';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { RequestListItem } from '../types/requestList';
import { useMemo } from 'react';
import { sortCollections } from '../util/sortCollections';

type ReduxState = {
  collections: {
    collectionSortOrder: 'default' | 'alphabetical' | 'reverseAlphabetical';
    collectionFilter: string;
    collections: CollectionSchema[];
    collectionCustomOrder: string[];
  };
  tabs: {
    activeTabUid: string | undefined;
  };
};

export const useRequestList = (): RequestListItem[] => {
  const { collections, collectionSortOrder, collectionFilter, collectionCustomOrder } = useSelector(
    (state: ReduxState) => state.collections
  );
  const activeTabUid = useSelector((state: ReduxState) => state.tabs.activeTabUid);

  return useMemo(() => {
    const items: RequestListItem[] = [];

    const insertItemsRecursive = (
      requestItems: RequestItemSchema[],
      collectionUid: string,
      indent: number,
      parentUid: string | null,
      filter: string | null
    ): RequestListItem[] => {
      const sorted = requestItems.toSorted((a, b) => {
        if (a.seq === undefined && b.seq !== undefined) {
          return -1;
        } else if (a.seq !== undefined && b.seq === undefined) {
          return 1;
        } else if (a.seq === undefined && b.seq === undefined) {
          return 0;
        }
        return a.seq < b.seq ? -1 : 1;
      });

      const newItems = [];
      for (const requestItem of sorted) {
        switch (requestItem.type) {
          case 'http-request':
          case 'graphql-request':
            if (filter && !requestItem.name.toLowerCase().includes(filter)) {
              continue;
            }
            newItems.push({
              type: 'request',
              collectionUid,
              indent,
              method: requestItem.request.method,
              name: requestItem.name,
              uid: requestItem.uid,
              parentUid,
              active: activeTabUid === requestItem.uid
            });
            break;
          case 'folder':
            const collapsed = filter === null ? requestItem.collapsed : false;

            let folderItems = [];
            if (!collapsed) {
              folderItems = insertItemsRecursive(requestItem.items, collectionUid, indent + 1, requestItem.uid, filter);
            }

            if (!filter || folderItems.length > 0) {
              newItems.push({
                type: 'folder',
                collectionUid,
                indent,
                name: requestItem.name,
                uid: requestItem.uid,
                parentUid,
                collapsed,
                active: activeTabUid === requestItem.uid
              });
              newItems.push(...folderItems);
            }

            break;
        }
      }

      return newItems;
    };

    const sortedCollections = sortCollections(collections, collectionSortOrder, collectionCustomOrder);
    for (const collection of sortedCollections) {
      items.push({
        type: 'collection',
        collapsed: collection.collapsed,
        name: collection.name,
        uid: collection.uid,
        active: activeTabUid === collection.uid
      });

      const filter = collectionFilter.trim().length > 0 ? collectionFilter.toLowerCase() : null;
      if (!collection.collapsed || filter !== null) {
        items.push(...insertItemsRecursive(collection.items, collection.uid, 1, null, filter));
      }
    }

    return items;
  }, [collections, collectionSortOrder, collectionFilter, collectionCustomOrder, activeTabUid]);
};
