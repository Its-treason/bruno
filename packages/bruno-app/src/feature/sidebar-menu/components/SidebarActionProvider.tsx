/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SidebarActionContext, SidebarActionTypes } from '../provider/SidebarActionContext';
import { useDispatch, useSelector } from 'react-redux';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { NewRequestModalContent } from './modalContent/NewRequestModalContent';
import { RenameCollectionModalContent } from './modalContent/RenameCollectionModalContent';
import { RenameItemModalContent } from './modalContent/RenameItemModalContent';
import { getDefaultRequestPaneTab, isItemARequest } from 'utils/collections';
import {
  runCollectionFolder,
  selectEnvironment,
  sendRequest,
  shellOpenCollectionPath
} from 'providers/ReduxStore/slices/collections/actions';
import { getCollectionAndItem } from '../util/getCollectionAndItem';
import { hideHomePage } from 'providers/ReduxStore/slices/app';
import { addTab, focusTab } from 'providers/ReduxStore/slices/tabs';
import { collectionClicked, collectionFolderClicked } from 'providers/ReduxStore/slices/collections';
import { uuid } from 'utils/common';
import { CodeGeneratorModal } from 'src/feature/code-generator';
import { Modal } from '@mantine/core';
import { CloneCollectionModalContent } from './modalContent/CloneCollectionModalContent';
import { CloneItemModalContent } from './modalContent/CloneItemModalContent';
import { DeleteItemModalContent } from './modalContent/DeleteItemModalContent';
import { NewFolderModalContent } from './modalContent/NewFolderModalContent';
import { CloseCollectionModalContent } from './modalContent/CloseCollectionModalContent';
import { ExportCollectionModalContent } from './modalContent/ExportCollectionModalContent';

type ActiveAction = {
  type: SidebarActionTypes;
  collection: CollectionSchema; // TODO: Refactor
  item?: any | RequestItemSchema;
};

const modalTitleMap: Record<SidebarActionTypes, string> = {
  'clone-collection': 'Clone collection',
  'close-collection': 'Close collection',
  'rename-collection': 'Rename collection',
  'export-collection': 'Export collection',
  clone: 'Clone item',
  'new-folder': 'New folder',
  'new-request': 'New request',
  delete: 'Delete item',
  rename: 'Rename item',
  generate: 'Generate code'
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
    dispatch(shellOpenCollectionPath(path, !itemUid, false));
  }, []);
  const openInEditor = useCallback((collectionUid: string, itemUid: string) => {
    const [_, item] = getCollectionAndItem(collectionsRef.current, collectionUid, itemUid);
    dispatch(shellOpenCollectionPath(item.pathname, true, true));
  }, []);
  const editBrunoJson = useCallback((collectionUid: string) => {
    const [collection] = getCollectionAndItem(collectionsRef.current, collectionUid);
    dispatch(shellOpenCollectionPath(collection.pathname, true, true));
  }, []);

  const openCollectionSettings = useCallback((collectionUid: string) => {
    dispatch(
      addTab({
        uid: collectionUid,
        collectionUid,
        type: 'collection-settings'
      })
    );
    dispatch(
      focusTab({
        uid: collectionUid
      })
    );
  }, []);
  const openFolderSettings = useCallback((collectionUid: string, folderUid: string) => {
    dispatch(
      addTab({
        uid: folderUid,
        collectionUid,
        folderUid,
        type: 'folder-settings'
      })
    );
    dispatch(
      focusTab({
        uid: folderUid
      })
    );
  }, []);
  const itemClicked = useCallback((collectionUid: string, itemUid?: string, toggleFolders: boolean = true) => {
    const [collection, item] = getCollectionAndItem(collectionsRef.current, collectionUid, itemUid);

    if (!item) {
      if (toggleFolders) {
        dispatch(collectionClicked(collection.uid));
      } else {
        openCollectionSettings(collection.uid);
      }

      // TODO: This should happen on the collection open event
      // if collection doesn't have any active environment
      // try to load last selected environment
      if (!collection.activeEnvironmentUid) {
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
        // TODO: This is bad. The Tab should listen to this themself
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
      dispatch(focusTab({ uid: item.uid }));
      return;
    }

    if (toggleFolders) {
      dispatch(
        collectionFolderClicked({
          itemUid: item.uid,
          collectionUid: collection.uid
        })
      );
    } else {
      openFolderSettings(collection.uid, item.uid);
    }
  }, []);
  const openRunner = useCallback((collectionUid: string, itemUid?: string) => {
    dispatch(
      addTab({
        uid: uuid(),
        collectionUid,
        type: 'collection-runner'
      })
    );
    if (itemUid) {
      dispatch(runCollectionFolder(collectionUid, itemUid, true));
    }
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
      openFolderSettings,
      openRunner,
      runRequest
    }),
    []
  );

  const modalContent = useMemo(() => {
    switch (activeAction?.type) {
      case 'clone':
        return (
          <CloneItemModalContent
            onClose={() => setActiveActionState(null)}
            collectionUid={activeAction.collection.uid}
            item={activeAction.item}
          />
        );
      case 'delete':
        return (
          <DeleteItemModalContent
            onClose={() => setActiveActionState(null)}
            collectionUid={activeAction.collection.uid}
            item={activeAction.item}
          />
        );
      case 'rename':
        return (
          <RenameItemModalContent
            onClose={() => setActiveActionState(null)}
            collectionUid={activeAction.collection.uid}
            item={activeAction.item}
          />
        );
      case 'new-request':
        return (
          <NewRequestModalContent
            onClose={() => setActiveActionState(null)}
            collectionUid={activeAction.collection.uid}
            brunoConfig={activeAction.collection.brunoConfig}
            itemUid={activeAction.item?.uid}
          />
        );
      case 'new-folder':
        return (
          <NewFolderModalContent
            onClose={() => setActiveActionState(null)}
            collectionUid={activeAction.collection.uid}
            itemUid={activeAction.item?.uid}
          />
        );
      case 'clone-collection':
        return (
          <CloneCollectionModalContent
            onClose={() => setActiveActionState(null)}
            collectionName={activeAction.collection.name}
            collectionPath={activeAction.collection.pathname}
          />
        );
      case 'close-collection':
        return (
          <CloseCollectionModalContent
            onClose={() => setActiveActionState(null)}
            collection={activeAction.collection}
          />
        );
      case 'export-collection':
        return (
          <ExportCollectionModalContent
            onClose={() => setActiveActionState(null)}
            collection={activeAction.collection}
          />
        );
      case 'rename-collection':
        return (
          <RenameCollectionModalContent
            onClose={() => setActiveActionState(null)}
            collection={activeAction.collection}
          />
        );
      case 'generate':
      default:
        return null;
    }
  }, [activeAction]);

  return (
    <SidebarActionContext.Provider value={contextData}>
      <Modal
        opened={modalContent !== null}
        size={activeAction?.type === 'new-request' ? 'lg' : undefined}
        title={modalTitleMap[activeAction?.type]}
        onClose={() => setActiveActionState(null)}
      >
        {modalContent}
      </Modal>

      <CodeGeneratorModal
        opened={activeAction?.type === 'generate'}
        onClose={() => setActiveActionState(null)}
        collectionUid={activeAction?.collection.uid}
        requestUid={activeAction?.item?.uid}
      />

      {children}
    </SidebarActionContext.Provider>
  );
};
