/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { CollectionSchema } from '@usebruno/schema';
import { useSelector } from 'react-redux';
import { findCollectionByUid, findEnvironmentInCollection, findItemInCollection } from 'utils/collections';
import { useQuery } from '@tanstack/react-query';

type ReduxStore = { collections: { collections: CollectionSchema[] } };

export function useGenerateCode(collectionId: string, requestId: string, targetId: string, clientId: string) {
  const collection: CollectionSchema = useSelector((store: ReduxStore) =>
    findCollectionByUid(store.collections.collections, collectionId)
  );

  return useQuery<string>({
    queryKey: [collectionId, requestId, targetId, clientId],
    retry: 0,
    queryFn: async () => {
      const item = findItemInCollection(collection, requestId);
      if (!item) {
        throw new Error(`Could not find request with ID: ${requestId}. (This is a Bug)`);
      }
      const environment = findEnvironmentInCollection(collection, collection.activeEnvironmentUid);

      const options = {
        targetId,
        clientId
      };

      // @ts-expect-error
      return await window.ipcRenderer.invoke('renderer:generate-code', item, collection, environment, options);
    }
  });
}
