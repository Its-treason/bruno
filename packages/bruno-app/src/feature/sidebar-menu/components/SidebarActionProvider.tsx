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
import { addTab, autoSaveTabContent, focusTab } from 'providers/ReduxStore/slices/tabs';
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
import { CollectionInfo, ItemInfo } from 'src/store/collectionStore';
import { appStore } from 'src/store/appStore';

type ActiveAction = {
  type: SidebarActionTypes;
  collection: CollectionInfo;
  item?: any | ItemInfo;
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

type SidebarActionProviderProps = {
  children: ReactNode;
};

export const SidebarActionProvider: React.FC<SidebarActionProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const [activeAction, setActiveActionState] = useState<ActiveAction | null>(null);

  const setActiveAction = useCallback(
    (type: SidebarActionTypes, collectionUid: string, itemUid: string | undefined) => {
      const [collection, item] = getCollectionAndItem(collectionUid, itemUid);
      setActiveActionState({ type, item, collection });
    },
    []
  );

  const openInExplorer = useCallback((collectionUid: string, itemUid?: string) => {
    const [collection, item] = getCollectionAndItem(collectionUid, itemUid);
    const path = item ? item.meta.path : collection.dirMeta.path;
    dispatch(shellOpenCollectionPath(path, !itemUid, false));
  }, []);
  const openInEditor = useCallback((collectionUid: string, itemUid: string) => {
    const [_, item] = getCollectionAndItem(collectionUid, itemUid);
    dispatch(shellOpenCollectionPath(item.meta.path, true, true));
  }, []);
  const editBrunoJson = useCallback((collectionUid: string) => {
    const [collection] = getCollectionAndItem(collectionUid);
    dispatch(shellOpenCollectionPath(collection.dirMeta.path, true, true));
  }, []);

  const openCollectionSettings = useCallback((collectionUid: string) => {
    dispatch(hideHomePage());
    dispatch(autoSaveTabContent);
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
    dispatch(hideHomePage());
    dispatch(autoSaveTabContent);
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
    const [collection, item] = getCollectionAndItem(collectionUid, itemUid);

    if (!item) {
      if (toggleFolders) {
        const appState = appStore.getState();
        appState.updateCollapsedItems(collectionUid, !appState.collapsedItems.get(collectionUid));
      } else {
        openCollectionSettings(collection.id);
      }

      // TODO: This should happen on the collection open event
      // if collection doesn't have any active environment
      // try to load last selected environment
      if (!collection.activeEnvironmentId) {
        window.ipcRenderer
          .invoke('renderer:get-last-selected-environment', collection.id)
          .then((lastSelectedEnvId: string) => {
            const collectionEnvironments = collection.environments;
            const lastSelectedEnvironment = collectionEnvironments.get(lastSelectedEnvId);
            if (lastSelectedEnvironment) {
              dispatch(selectEnvironment(lastSelectedEnvironment.id, collection.id));
            } else {
              console.warn('Last selected env id not found :((', lastSelectedEnvId);
            }
          });
      }
      return;
    }

    if (item.type === 'request') {
      setTimeout(() => {
        // TODO: This is bad. The Tab should listen to this themself
        const activeTab = document.querySelector('.request-tab.active');
        if (activeTab) {
          activeTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);

      dispatch(hideHomePage());
      dispatch(autoSaveTabContent);
      dispatch(
        addTab({
          uid: item.id,
          collectionUid: collection.id,
          requestPaneTab: getDefaultRequestPaneTab(item)
        })
      );
      dispatch(focusTab({ uid: item.id }));
      return;
    }

    if (toggleFolders) {
      const appState = appStore.getState();
      appState.updateCollapsedItems(item.id, !appState.collapsedItems.get(item.id));
    } else {
      openFolderSettings(collection.id, item.id);
    }
  }, []);
  const openRunner = useCallback((collectionUid: string, itemUid?: string) => {
    dispatch(hideHomePage());
    dispatch(autoSaveTabContent);
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
    const [_, item] = getCollectionAndItem(collectionUid, itemUid);
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
            collectionUid={activeAction.collection.id}
            item={activeAction.item}
          />
        );
      case 'delete':
        return (
          <DeleteItemModalContent
            onClose={() => setActiveActionState(null)}
            collectionUid={activeAction.collection.id}
            item={activeAction.item}
          />
        );
      case 'rename':
        return (
          <RenameItemModalContent
            onClose={() => setActiveActionState(null)}
            collectionUid={activeAction.collection.id}
            item={activeAction.item}
          />
        );
      case 'new-request':
        return (
          <NewRequestModalContent
            onClose={() => setActiveActionState(null)}
            collectionUid={activeAction.collection.id}
            brunoConfig={activeAction.collection.config}
            itemUid={activeAction.item?.uid}
          />
        );
      case 'new-folder':
        return (
          <NewFolderModalContent
            onClose={() => setActiveActionState(null)}
            collectionUid={activeAction.collection.id}
            itemUid={activeAction.item?.uid}
          />
        );
      case 'clone-collection':
        return (
          <CloneCollectionModalContent
            onClose={() => setActiveActionState(null)}
            collectionName={activeAction.collection.data?.name || activeAction.collection.data?.name}
            collectionPath={activeAction.collection.dirMeta.path}
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
        collectionUid={activeAction?.collection.id}
        requestUid={activeAction?.item?.uid}
      />

      {children}
    </SidebarActionContext.Provider>
  );
};
