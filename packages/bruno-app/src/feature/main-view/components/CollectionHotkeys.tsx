import { Modal } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { EnvironmentDrawer } from 'feature/environment-editor';
import { NewRequestModalContent } from 'feature/sidebar-menu/components/modalContent/NewRequestModalContent';
import { useAppHotkeys } from 'hooks/useAppHotkeys';
import { saveCollectionRoot, saveFolderRoot, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import { autoSaveTabContent, closeTabs, switchTab } from 'providers/ReduxStore/slices/tabs';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { appStore } from 'src/store/appStore';
import { useStore } from 'zustand';

type CollectionHotkeys = {
  collectionId: string;
  itemId?: string;
  activeTab: { uid: string; type: string };
  tabs: { uid: string; collectionUid: string }[];
};

export const CollectionHotkeys: React.FC<CollectionHotkeys> = ({ collectionId, activeTab, itemId, tabs }) => {
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
            dispatch(saveFolderRoot(collectionId, itemId));
            break;
          case 'collection-settings':
            dispatch(saveCollectionRoot(collectionId));
            break;
          case 'request':
            dispatch(saveRequest(itemId, collectionId));
            break;
        }
      }
    ],
    [
      hotkeys.sendRequest,
      () => {
        if (disableHotkeys || !itemId) {
          return;
        }
        //dispatch(sendRequest(item, collection.id));
        console.log('TODO: Reimplement sendRequest', itemId);
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
        const tabUids = tabs.filter((tab) => tab.collectionUid === collectionId).map((tab) => tab.uid);
        dispatch(closeTabs({ tabUids }));
      }
    ],
    [
      hotkeys.switchToNextTab,
      () => {
        if (disableHotkeys) {
          return;
        }
        dispatch(autoSaveTabContent);
        dispatch(switchTab({ direction: 'pagedown' }));
      }
    ],
    [
      hotkeys.switchToPreviousTab,
      () => {
        if (disableHotkeys) {
          return;
        }
        dispatch(autoSaveTabContent);
        dispatch(switchTab({ direction: 'pageup' }));
      }
    ]
  ]);

  return (
    <>
      <EnvironmentDrawer
        opened={showEnvironmentModal}
        collection={collectionId}
        onClose={() => setShowEnvironmentModal(false)}
      />

      <Modal opened={showNewRequestModal} onClose={() => setShowNewRequestModal(false)} title="New request" size={'lg'}>
        {showNewRequestModal ? (
          <NewRequestModalContent collectionId={collectionId} onClose={() => setShowNewRequestModal(false)} />
        ) : null}
      </Modal>
    </>
  );
};
