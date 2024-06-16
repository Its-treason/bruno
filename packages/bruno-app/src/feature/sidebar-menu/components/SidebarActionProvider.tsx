/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SidebarActionContext, SidebarActionTypes } from '../provider/SidebarActionContext';
import { useDispatch, useSelector } from 'react-redux';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { CloneCollectionModal } from './modals/CloneCollectionModal';
import { CloneItemModal } from './modals/CloneItemModal';
import { CloseCollectionModal } from './modals/CloseCollectionModal';
import { DeleteItemModal } from './modals/DeleteItemModal';
import { ExportCollectionModal } from './modals/ExportCollectionModal';
import { NewFolderModal } from './modals/NewFolderModal';
import { NewRequestModal } from './modals/NewRequestModal';
import { RenameCollectionModal } from './modals/RenameCollectionModal';
import { RenameItemModal } from './modals/RenameItemModal';
import GenerateCodeItem from 'components/Sidebar/Collections/Collection/CollectionItem/GenerateCodeItem';
import { getDefaultRequestPaneTab, isItemARequest } from 'utils/collections';
import {
  selectEnvironment,
  sendRequest,
  shellOpenCollectionPath
} from 'providers/ReduxStore/slices/collections/actions';
import { getCollectionAndItem } from '../util/getCollectionAndItem';
import { hideHomePage } from 'providers/ReduxStore/slices/app';
import { addTab, focusTab } from 'providers/ReduxStore/slices/tabs';
import { collectionClicked, collectionFolderClicked } from 'providers/ReduxStore/slices/collections';
import { uuid } from 'utils/common';

type ActiveAction = {
  type: SidebarActionTypes;
  // collection: CollectionSchema;
  // item?: RequestItemSchema;
  collection: any;
  item?: any; // TODO Fix this
};

type ReduxState = {
  collections: {
    collections: CollectionSchema[];
  };
};

type SidebarActionProviderProps = {
  children: ReactNode;
};

export const SidebarActionProvider: React.FC<SidebarActionProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { collections } = useSelector((state: ReduxState) => state.collections);
  // Ref this here so the callbacks don't need be executed for every change in the collection
  const collectionsRef = useRef(collections);
  useEffect(() => {
    collectionsRef.current = collections;
  }, [collections]);

  const [activeAction, setActiveActionState] = useState<ActiveAction | null>(null);

  const setActiveAction = useCallback(
    (type: SidebarActionTypes, collectionUid: string, itemUid: string | undefined) => {
      const [collection, item] = getCollectionAndItem(collectionsRef.current, collectionUid, itemUid);
      setActiveActionState({ type, item, collection });
    },
    []
  );

  const openInExplorer = useCallback((collectionUid: string, itemUid?: string) => {
    const [collection, item] = getCollectionAndItem(collectionsRef.current, collectionUid, itemUid);
    const path = item ? item.pathname : collection.pathname;
    dispatch(shellOpenCollectionPath(path, true, false));
  }, []);
  const openInEditor = useCallback((collectionUid: string, itemUid: string) => {
    const [_, item] = getCollectionAndItem(collectionsRef.current, collectionUid, itemUid);
    dispatch(shellOpenCollectionPath(item.pathname, true, true));
  }, []);
  const editBrunoJson = useCallback((collectionUid: string) => {
    const [collection] = getCollectionAndItem(collectionsRef.current, collectionUid);
    dispatch(shellOpenCollectionPath(collection.pathname, true, true));
  }, []);

  const itemClicked = useCallback((collectionUid: string, itemUid?: string) => {
    const [collection, item] = getCollectionAndItem(collectionsRef.current, collectionUid, itemUid);

    if (!item) {
      dispatch(collectionClicked(collection.uid));

      // TODO: This should happen on the collection open event
      // if collection doesn't have any active environment
      // try to load last selected environment
      if (!collection.activeEnvironmentUid) {
        // @ts-expect-error
        window.ipcRenderer
          .invoke('renderer:get-last-selected-environment', collection.uid)
          .then((lastSelectedEnvName: string) => {
            const collectionEnvironments = collection.environments || [];
            const lastSelectedEnvironment = collectionEnvironments.find((env) => env.name === lastSelectedEnvName);
            if (lastSelectedEnvironment) {
              dispatch(selectEnvironment(lastSelectedEnvironment.uid, collection.uid));
            }
          });
      }
      return;
    }

    if (isItemARequest(item)) {
      setTimeout(() => {
        // TODO: This is bad
        const activeTab = document.querySelector('.request-tab.active');
        if (activeTab) {
          activeTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
      dispatch(hideHomePage());
      dispatch(
        addTab({
          uid: item.uid,
          collectionUid: collection.uid,
          requestPaneTab: getDefaultRequestPaneTab(item)
        })
      );
      dispatch(
        focusTab({
          uid: item.uid
        })
      );
      return;
    }
    dispatch(
      collectionFolderClicked({
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  }, []);
  const openCollectionSettings = useCallback((collectionUid: string) => {
    dispatch(
      addTab({
        uid: uuid(),
        collectionUid,
        type: 'collection-settings'
      })
    );
  }, []);
  const openRunner = useCallback((collectionUid: string) => {
    // TODO: This needs to handle folder stuff
    dispatch(
      addTab({
        uid: uuid(),
        collectionUid,
        type: 'collection-runner'
      })
    );
  }, []);
  const runRequest = useCallback((collectionUid: string, itemUid: string) => {
    const [_, item] = getCollectionAndItem(collectionsRef.current, collectionUid, itemUid);
    dispatch(sendRequest(item, collectionUid));
  }, []);

  const contextData = useMemo(
    () => ({
      setActiveAction,

      openInExplorer,
      openInEditor,
      editBrunoJson,

      itemClicked,
      openCollectionSettings,
      openRunner,
      runRequest
    }),
    []
  );

  return (
    <SidebarActionContext.Provider value={contextData}>
      <CloneCollectionModal
        opened={activeAction?.type === 'clone-collection'}
        onClose={() => setActiveActionState(null)}
        collectionName={activeAction?.collection.name}
        collectionPath={activeAction?.collection}
      />
      <CloneItemModal
        opened={activeAction?.type === 'clone'}
        onClose={() => setActiveActionState(null)}
        collectionUid={activeAction?.collection.uid ?? ''}
        item={activeAction?.item}
      />
      <CloseCollectionModal
        opened={activeAction?.type === 'close-collection'}
        onClose={() => setActiveActionState(null)}
        collection={activeAction?.collection}
      />
      <DeleteItemModal
        opened={activeAction?.type === 'delete'}
        onClose={() => setActiveActionState(null)}
        collectionUid={activeAction?.collection.uid ?? ''}
        item={activeAction?.item}
      />
      <ExportCollectionModal
        opened={activeAction?.type === 'export-collection'}
        onClose={() => setActiveActionState(null)}
        collection={activeAction?.collection}
      />
      <NewFolderModal
        opened={activeAction?.type === 'new-folder'}
        onClose={() => setActiveActionState(null)}
        collectionUid={activeAction?.collection.uid ?? ''}
      />
      <NewRequestModal
        opened={activeAction?.type === 'new-request'}
        onClose={() => setActiveActionState(null)}
        brunoConfig={activeAction?.collection.brunoConfig}
        collectionUid={activeAction?.collection.uid ?? ''}
        itemUid={activeAction?.item?.uid ?? ''}
      />
      <RenameCollectionModal
        opened={activeAction?.type === 'rename-collection'}
        onClose={() => setActiveActionState(null)}
        collection={activeAction?.collection}
      />
      <RenameItemModal
        opened={activeAction?.type === 'rename'}
        onClose={() => setActiveActionState(null)}
        collectionUid={activeAction?.collection.uid ?? ''}
        item={activeAction?.item}
      />
      {activeAction?.type === 'generate' ? (
        <GenerateCodeItem
          collection={activeAction.collection}
          onClose={() => setActiveActionState(null)}
          item={activeAction.item}
        />
      ) : null}

      {children}
    </SidebarActionContext.Provider>
  );
};
