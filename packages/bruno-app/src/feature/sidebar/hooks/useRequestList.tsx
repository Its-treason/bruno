/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useSelector } from 'react-redux';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { RequestListItem } from '../types/requestList';
import { useMemo } from 'react';

type ReduxState = {
  collections: {
    collectionSortOrder: 'default' | 'asc' | 'desc';
    collections: CollectionSchema[];
  };
  tabs: {
    activeTabUid: string | undefined;
  };
};

// TODO: Pass collection sort order and filter here
export const useRequestList = (): RequestListItem[] => {
  const { collections, collectionSortOrder } = useSelector((state: ReduxState) => state.collections);
  const activeTabUid = useSelector((state: ReduxState) => state.tabs.activeTabUid);

  return useMemo(() => {
    const items: RequestListItem[] = [];

    const insertItemsRecursive = (
      requestItems: RequestItemSchema[],
      collectionUid: string,
      indent: number,
      parentUid: string | null
    ) => {
      const sorted = [...requestItems].sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') {
          return -1;
        } else if (a.type !== 'folder' && b.type === 'folder') {
          return 1;
        } else if (a.type === 'folder' && b.type === 'folder') {
          return 0;
        }
        return a.seq > b.seq ? -1 : 1;
      });
      for (const requestItem of sorted) {
        switch (requestItem.type) {
          case 'http-request':
          case 'graphql-request':
            items.push({
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
            items.push({
              type: 'folder',
              collectionUid,
              indent,
              name: requestItem.name,
              uid: requestItem.uid,
              parentUid,
              collapsed: requestItem.collapsed
            });
            if (!requestItem.collapsed) {
              insertItemsRecursive(requestItem.items, collectionUid, indent + 1, requestItem.uid);
            }
            break;
        }
      }
    };

    console.time('useRequestList');
    for (const collection of collections) {
      items.push({
        type: 'collection',
        collapsed: collection.collapsed,
        name: collection.name,
        uid: collection.uid
      });

      if (!collection.collapsed) {
        insertItemsRecursive(collection.items, collection.uid, 1, null);
      }
    }
    console.timeEnd('useRequestList');

    return items;
  }, [collections, collectionSortOrder, activeTabUid]);
};
