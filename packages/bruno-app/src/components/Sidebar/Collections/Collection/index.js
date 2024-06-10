import React, { useState, useRef, useEffect } from 'react';
import classnames from 'classnames';
import filter from 'lodash/filter';
import { useDrop } from 'react-dnd';
import { IconChevronRight } from '@tabler/icons-react';
import { collectionClicked } from 'providers/ReduxStore/slices/collections';
import { moveItemToRootOfCollection } from 'providers/ReduxStore/slices/collections/actions';
import { useDispatch } from 'react-redux';
import CollectionItem from './CollectionItem';
import { doesCollectionHaveItemsMatchingSearchText } from 'utils/collections/search';
import { isItemAFolder, isItemARequest } from 'utils/collections';

import StyledWrapper from './StyledWrapper';
import { selectEnvironment } from 'providers/ReduxStore/slices/collections/actions';
import { CollectionMenu } from 'src/feature/sidebar-menu';

const Collection = ({ collection, searchText }) => {
  const [collectionIsCollapsed, setCollectionIsCollapsed] = useState(collection.collapsed);
  const dispatch = useDispatch();

  const menuDropdownTippyRef = useRef();

  useEffect(() => {
    if (searchText && searchText.length) {
      setCollectionIsCollapsed(false);
    } else {
      setCollectionIsCollapsed(collection.collapsed);
    }
  }, [searchText, collection]);

  const iconClassName = classnames({
    'rotate-90': !collectionIsCollapsed
  });

  const handleClick = (event) => {
    dispatch(collectionClicked(collection.uid));

    // if collection doesn't have any active environment
    // try to load last selected environment
    if (!collection.activeEnvironmentUid) {
      window.ipcRenderer
        .invoke('renderer:get-last-selected-environment', collection.uid)
        .then((lastSelectedEnvName) => {
          const collectionEnvironments = collection.environments || [];
          const lastSelectedEnvironment = collectionEnvironments.find((env) => env.name === lastSelectedEnvName);

          if (lastSelectedEnvironment) {
            dispatch(selectEnvironment(lastSelectedEnvironment.uid, collection.uid));
          }
        });
    }
  };

  const handleRightClick = (event) => {
    const _menuDropdown = menuDropdownTippyRef.current;
    if (_menuDropdown) {
      let menuDropdownBehavior = 'show';
      if (_menuDropdown.state.isShown) {
        menuDropdownBehavior = 'hide';
      }
      _menuDropdown[menuDropdownBehavior]();
    }
  };

  const [{ isOver }, drop] = useDrop({
    accept: `COLLECTION_ITEM_${collection.uid}`,
    drop: (draggedItem) => {
      dispatch(moveItemToRootOfCollection(collection.uid, draggedItem.uid));
    },
    canDrop: (draggedItem) => {
      // todo need to make sure that draggedItem belongs to the collection
      return true;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  if (searchText && searchText.length) {
    if (!doesCollectionHaveItemsMatchingSearchText(collection, searchText)) {
      return null;
    }
  }

  // we need to sort request items by seq property
  const sortRequestItems = (items = []) => {
    return items.sort((a, b) => a.seq - b.seq);
  };

  // we need to sort folder items by name alphabetically
  const sortFolderItems = (items = []) => {
    return items.sort((a, b) => a.name.localeCompare(b.name));
  };

  const requestItems = sortRequestItems(filter(collection.items, (i) => isItemARequest(i)));
  const folderItems = sortFolderItems(filter(collection.items, (i) => isItemAFolder(i)));

  return (
    <StyledWrapper className="flex flex-col">
      <div className="flex py-1 collection-name items-center" ref={drop}>
        <div
          className="flex flex-grow items-center overflow-hidden"
          onClick={handleClick}
          onContextMenu={handleRightClick}
        >
          <IconChevronRight
            size={16}
            strokeWidth={2}
            className={iconClassName}
            style={{ width: 16, minWidth: 16, color: 'rgb(160 160 160)' }}
          />
          <div className="ml-1" id="sidebar-collection-name">
            {collection.name}
          </div>
        </div>
        <div className="collection-actions">
          <CollectionMenu collection={collection} />
        </div>
      </div>

      <div>
        {!collectionIsCollapsed ? (
          <div>
            {folderItems && folderItems.length
              ? folderItems.map((i) => {
                  return <CollectionItem key={i.uid} item={i} collection={collection} searchText={searchText} />;
                })
              : null}
            {requestItems && requestItems.length
              ? requestItems.map((i) => {
                  return <CollectionItem key={i.uid} item={i} collection={collection} searchText={searchText} />;
                })
              : null}
          </div>
        ) : null}
      </div>
    </StyledWrapper>
  );
};

export default Collection;
