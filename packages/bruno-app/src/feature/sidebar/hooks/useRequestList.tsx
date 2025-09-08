/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useSelector } from 'react-redux';
import { CollectionSchema } from '@usebruno/schema';
import { RequestListItem } from '../types/requestList';
import { useMemo } from 'react';
import { sortCollections } from '../util/sortCollections';
import { useStore } from 'zustand';
import { collectionStore } from 'src/store/collectionStore';
import { appStore } from 'src/store/appStore';

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
  const activeTabUid = useSelector((state: ReduxState) => state.tabs.activeTabUid);

  const sidebarFilter = useStore(appStore, (state) => state.sidebarFilter);
  const sortOrder = useStore(appStore, (state) => state.collectionSortOrder);
  const customOrder = useStore(appStore, (state) => state.collectionCustomOrder);
  const collapsedItems = useStore(appStore, (state) => state.collapsedItems);

  console.log('coll', collapsedItems);

  const collections = useStore(collectionStore, (state) => state.collections);
  const collectionItems = useStore(collectionStore, (state) => state.items);

  return useMemo(() => {
    const items: RequestListItem[] = [];

    const insertItemsRecursive = (
      requestItemIds: string[],
      collectionUid: string,
      indent: number,
      parentUid: string | null,
      filter: string | null
    ): RequestListItem[] => {
      const requestItems = requestItemIds.map((id) => collectionItems.get(id));

      const sorted = requestItems.toSorted((a, b) => {
        const aSeq = a.type === 'dir' ? a.data?.seq : a.data?.meta.seq;
        const bSeq = b.type === 'dir' ? b.data?.seq : b.data?.meta.seq;

        if (aSeq === undefined && bSeq !== undefined) {
          return -1;
        } else if (aSeq !== undefined && bSeq === undefined) {
          return 1;
        } else if (aSeq === undefined && bSeq === undefined) {
          return 0;
        }
        return aSeq < bSeq ? -1 : 1;
      });

      const newItems = [];
      for (const requestItem of sorted) {
        switch (requestItem.type) {
          case 'request':
            if (filter && !requestItem.data.meta.name.toLowerCase().includes(filter)) {
              continue;
            }
            newItems.push({
              type: 'request',
              collectionUid,
              indent,
              method: requestItem.data.http.method,
              name: requestItem.data.meta.name,
              uid: requestItem.id,
              parentUid,
              active: activeTabUid === requestItem.id
            });
            break;
          case 'dir':
            const collapsed = filter === null ? !!collapsedItems.get(requestItem.id) : false;

            let folderItems = [];
            if (!collapsed) {
              const children = Array.from(requestItem.children.values());
              folderItems = insertItemsRecursive(children, collectionUid, indent + 1, requestItem.id, filter);
            }

            if (!filter || folderItems.length > 0) {
              newItems.push({
                type: 'folder',
                collectionUid,
                indent,
                name: requestItem.data?.name || requestItem.meta.basename,
                uid: requestItem.id,
                parentUid,
                collapsed,
                active: activeTabUid === requestItem.id
              });
              newItems.push(...folderItems);
            }

            break;
        }
      }

      return newItems;
    };

    const sortedCollections = sortCollections(Array.from(collections.values()), sortOrder, customOrder);
    for (const collection of sortedCollections) {
      if (!collection.loadFinishedDate) {
        continue;
      }

      const collapsed = !!collapsedItems.get(collection.id);
      console.log('rea', collapsed);
      items.push({
        type: 'collection',
        collapsed,
        name: collection.config?.name || collection.dirMeta.basename,
        uid: collection.id,
        active: activeTabUid === collection.id
      });

      const filter = sidebarFilter.trim().length > 0 ? sidebarFilter.toLowerCase() : null;
      if (!collapsed || filter !== null) {
        const children = Array.from(collection.children.values());
        items.push(...insertItemsRecursive(children, collection.id, 1, null, filter));
      }
    }

    return items;
  }, [sidebarFilter, sortOrder, customOrder, collapsedItems, collections, collectionItems]);
};
