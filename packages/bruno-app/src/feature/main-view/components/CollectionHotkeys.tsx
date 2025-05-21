import { Modal } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { EnvironmentDrawer } from 'feature/environment-editor';
import { NewRequestModalContent } from 'feature/sidebar-menu/components/modalContent/NewRequestModalContent';
import { useAppHotkeys } from 'hooks/useAppHotkeys';
import {
  saveCollectionRoot,
  saveFolderRoot,
  saveRequest,
  sendRequest
} from 'providers/ReduxStore/slices/collections/actions';
import { closeTabs, switchTab } from 'providers/ReduxStore/slices/tabs';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { appStore } from 'src/store/appStore';
import { useStore } from 'zustand';

type CollectionHotkeys = {
  collection: CollectionSchema;
  item: RequestItemSchema;
  activeTab: { uid: string; type: string };
  tabs: { uid: string; collectionUid: string }[];
};

export const CollectionHotkeys: React.FC<CollectionHotkeys> = ({ collection, activeTab, item, tabs }) => {
  const dispatch = useDispatch();
  const hotkeys = useAppHotkeys();
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showEnvironmentModal, setShowEnvironmentModal] = useState(false);
  const { cookiesOpen, preferencesOpen } = useStore(appStore);

  const disableHotkeys = showEnvironmentModal || showNewRequestModal || cookiesOpen || preferencesOpen;

  useHotkeys([
    [hotkeys.newRequest, () => setShowNewRequestModal(true)],
    [hotkeys.editEnvironment, () => setShowEnvironmentModal(true)],
    [
      hotkeys.save,
      () => {
        // The Environment Modal has its own save handler
        if (disableHotkeys) {
          return;
        }

        switch (activeTab.type) {
          case 'folder-settings':
            dispatch(saveFolderRoot(collection.uid, item.uid));
            break;
          case 'collection-settings':
            dispatch(saveCollectionRoot(collection.uid));
            break;
          case 'request':
            dispatch(saveRequest(item.uid, collection.uid));
            break;
        }
      }
    ],
    [
      hotkeys.sendRequest,
      () => {
        if (disableHotkeys || !item) {
          return;
        }
        dispatch(sendRequest(item, collection.uid));
      }
    ],
    // Tabs
    [
      hotkeys.closeTab,
      () => {
        if (disableHotkeys) {
          return;
        }
        dispatch(closeTabs({ tabUids: [activeTab.uid] }));
      }
    ],
    [
      hotkeys.closeAllTabs,
      () => {
        if (disableHotkeys) {
          return;
        }
        const tabUids = tabs.filter((tab) => tab.collectionUid === collection.uid).map((tab) => tab.uid);
        dispatch(closeTabs({ tabUids }));
      }
    ],
    [
      hotkeys.switchToNextTab,
      () => {
        if (disableHotkeys) {
          return;
        }
        dispatch(switchTab({ direction: 'pagedown' }));
      }
    ],
    [
      hotkeys.switchToPreviousTab,
      () => {
        if (disableHotkeys) {
          return;
        }
        dispatch(switchTab({ direction: 'pageup' }));
      }
    ]
  ]);

  return (
    <>
      <EnvironmentDrawer
        opened={showEnvironmentModal}
        collection={collection}
        onClose={() => setShowEnvironmentModal(false)}
      />

      <Modal opened={showNewRequestModal} onClose={() => setShowNewRequestModal(false)} title="New request" size={'lg'}>
        {showNewRequestModal ? (
          <NewRequestModalContent
            brunoConfig={collection.brunoConfig}
            collectionUid={collection.uid}
            onClose={() => setShowNewRequestModal(false)}
          />
        ) : null}
      </Modal>
    </>
  );
};
