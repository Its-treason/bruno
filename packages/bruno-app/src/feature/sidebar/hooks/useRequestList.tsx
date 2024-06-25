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
    collectionFilter: string;
    collections: CollectionSchema[];
  };
  tabs: {
    activeTabUid: string | undefined;
  };
};

export const useRequestList = (): RequestListItem[] => {
  const { collections, collectionSortOrder, collectionFilter } = useSelector((state: ReduxState) => state.collections);
  const activeTabUid = useSelector((state: ReduxState) => state.tabs.activeTabUid);

  return useMemo(() => {
    const items: RequestListItem[] = [];

    const insertItemsRecursive = (
      requestItems: RequestItemSchema[],
      collectionUid: string,
      indent: number,
      parentUid: string | null,
      filter: string | null
    ) => {
      const sorted = [...requestItems].sort((a, b) => {
        if (a.seq === undefined && b.seq !== undefined) {
          return -1;
        } else if (a.seq !== undefined && b.seq === undefined) {
          return 1;
        } else if (a.seq === undefined && b.seq === undefined) {
          return 0;
        }
        return a.seq < b.seq ? -1 : 1;
      });
      for (const requestItem of sorted) {
        switch (requestItem.type) {
          case 'http-request':
          case 'graphql-request':
            if (collectionFilter && !requestItem.name.includes(collectionFilter)) {
              continue;
            }
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
            const collapsed = filter === null ? requestItem.collapsed : false;
            items.push({
              type: 'folder',
              collectionUid,
              indent,
              name: requestItem.name,
              uid: requestItem.uid,
              parentUid,
              collapsed
            });
            if (!collapsed) {
              insertItemsRecursive(requestItem.items, collectionUid, indent + 1, requestItem.uid, filter);
            }
            break;
        }
      }
    };

    for (const collection of collections) {
      items.push({
        type: 'collection',
        collapsed: collection.collapsed,
        name: collection.name,
        uid: collection.uid
      });

      const filter = collectionFilter.trim().length > 0 ? collectionFilter : null;
      if (!collection.collapsed || filter !== null) {
        insertItemsRecursive(collection.items, collection.uid, 1, null, filter);
      }
    }

    return items;
  }, [collections, collectionSortOrder, collectionFilter, activeTabUid]);
};
