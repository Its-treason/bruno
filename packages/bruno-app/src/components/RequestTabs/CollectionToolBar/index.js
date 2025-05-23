import { uuid } from 'utils/common';
import { IconFiles } from '@tabler/icons-react';
import { EnvironmentSelector } from 'src/feature/environment-editor/components/EnvironmentSelector';
import { addTab } from 'providers/ReduxStore/slices/tabs';
import { useDispatch, useSelector } from 'react-redux';
import StyledWrapper from './StyledWrapper';
import { findItemInCollection } from 'utils/collections';
import { CollectionTabButtons } from './CollectionTabButtons';

const CollectionToolBar = ({ collection, activeTabUid }) => {
  const dispatch = useDispatch();
  const tabs = useSelector((state) => state.tabs.tabs);
  const activeTab = tabs.find((tab) => tab.uid === activeTabUid);

  const viewCollectionSettings = () => {
    dispatch(
      addTab({
        uid: uuid(),
        collectionUid: collection.uid,
        type: 'collection-settings'
      })
    );
  };

  let tabType = null;
  let tabInfo = null;
  switch (activeTab.type) {
    case 'request':
      const item = findItemInCollection(collection, activeTabUid);
      if (item) {
        tabInfo = item.name;
        if (item.draft) {
          tabInfo += '*';
        }
      }
      break;
    case 'collection-settings':
      tabInfo = 'Settings';
      tabType = 'collection-settings';
      break;
    case 'variables':
      tabInfo = 'Variables';
      tabType = 'variables';
      break;
    case 'collection-runner':
      tabInfo = 'Runner';
      tabType = 'collection-runner';
      break;
    case 'folder-settings':
      tabInfo = 'Folder Settings';
      break;
    default:
      console.error('No tab type case for: ', activeTab.type);
  }

  return (
    <StyledWrapper>
      <div className="flex items-center p-2">
        <div className="flex flex-1 gap-2">
          <div className="flex items-center cursor-pointer hover:underline" onClick={viewCollectionSettings}>
            <IconFiles size={18} strokeWidth={1.5} />
            <span className="ml-2 font-semibold">{collection.name}</span>
          </div>
          {tabInfo ? (
            <>
              <span className="font-semibold">-</span>
              <span className="font-semibold">{tabInfo}</span>
            </>
          ) : null}
        </div>
        <div className="flex flex-1 items-center justify-end">
          <CollectionTabButtons activeTabType={tabType} collectionUid={collection.uid} />

          <EnvironmentSelector collection={collection} />
        </div>
      </div>
    </StyledWrapper>
  );
};

export default CollectionToolBar;
