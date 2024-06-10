import React, { useState, useRef, useEffect } from 'react';
import range from 'lodash/range';
import filter from 'lodash/filter';
import classnames from 'classnames';
import { useDrag, useDrop } from 'react-dnd';
import { IconChevronRight } from '@tabler/icons-react';
import { useSelector, useDispatch } from 'react-redux';
import { addTab, focusTab } from 'providers/ReduxStore/slices/tabs';
import { moveItem } from 'providers/ReduxStore/slices/collections/actions';
import { collectionFolderClicked } from 'providers/ReduxStore/slices/collections';
import RequestMethod from './RequestMethod';
import { isItemARequest, isItemAFolder, itemIsOpenedInTabs } from 'utils/tabs';
import { doesRequestMatchSearchText, doesFolderHaveItemsMatchSearchText } from 'utils/collections/search';
import { getDefaultRequestPaneTab } from 'utils/collections';
import { hideHomePage } from 'providers/ReduxStore/slices/app';
import StyledWrapper from './StyledWrapper';
import { FolderMenu, RequestMenu } from 'src/feature/sidebar-menu';

const CollectionItem = ({ item, collection, searchText }) => {
  const tabs = useSelector((state) => state.tabs.tabs);
  const activeTabUid = useSelector((state) => state.tabs.activeTabUid);
  const isSidebarDragging = useSelector((state) => state.app.isDragging);
  const dispatch = useDispatch();

  const [itemIsCollapsed, setItemisCollapsed] = useState(item.collapsed);

  const [_, drag] = useDrag({
    type: `COLLECTION_ITEM_${collection.uid}`,
    item: item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [{ isOver }, drop] = useDrop({
    accept: `COLLECTION_ITEM_${collection.uid}`,
    drop: (draggedItem) => {
      if (draggedItem.uid !== item.uid) {
        dispatch(moveItem(collection.uid, draggedItem.uid, item.uid));
      }
    },
    canDrop: (draggedItem) => {
      return draggedItem.uid !== item.uid;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  useEffect(() => {
    if (searchText && searchText.length) {
      setItemisCollapsed(false);
    } else {
      setItemisCollapsed(item.collapsed);
    }
  }, [searchText, item]);

  const dropdownTippyRef = useRef();

  const iconClassName = classnames({
    'rotate-90': !itemIsCollapsed
  });

  const itemRowClassName = classnames('flex collection-item-name items-center', {
    'item-focused-in-tab': item.uid == activeTabUid,
    'item-hovered': isOver
  });

  const scrollToTheActiveTab = () => {
    const activeTab = document.querySelector('.request-tab.active');
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleClick = () => {
    //scroll to the active tab
    setTimeout(scrollToTheActiveTab, 50);

    if (isItemARequest(item)) {
      dispatch(hideHomePage());
      if (itemIsOpenedInTabs(item, tabs)) {
        dispatch(
          focusTab({
            uid: item.uid
          })
        );
        return;
      }
      dispatch(
        addTab({
          uid: item.uid,
          collectionUid: collection.uid,
          requestPaneTab: getDefaultRequestPaneTab(item)
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
  };

  const handleRightClick = (event) => {
    const _menuDropdown = dropdownTippyRef.current;
    if (_menuDropdown) {
      let menuDropdownBehavior = 'show';
      if (_menuDropdown.state.isShown) {
        menuDropdownBehavior = 'hide';
      }
      _menuDropdown[menuDropdownBehavior]();
    }
  };

  const handleDoubleClick = (event) => {
    setRenameItemModalOpen(true);
  };

  let indents = range(item.depth);
  const isFolder = isItemAFolder(item);

  const className = classnames('flex flex-col w-full', {
    'is-sidebar-dragging': isSidebarDragging
  });

  if (searchText && searchText.length) {
    if (isItemARequest(item)) {
      if (!doesRequestMatchSearchText(item, searchText)) {
        return null;
      }
    } else {
      if (!doesFolderHaveItemsMatchSearchText(item, searchText)) {
        return null;
      }
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
  const requestItems = sortRequestItems(filter(item.items, (i) => isItemARequest(i)));
  const folderItems = sortFolderItems(filter(item.items, (i) => isItemAFolder(i)));

  return (
    <StyledWrapper className={className}>
      <div className={itemRowClassName} ref={(node) => drag(drop(node))}>
        <div className="flex items-center h-full w-full">
          {indents && indents.length
            ? indents.map((i) => {
                return (
                  <div
                    onClick={handleClick}
                    onContextMenu={handleRightClick}
                    onDoubleClick={handleDoubleClick}
                    className="indent-block"
                    key={i}
                    style={{
                      width: 16,
                      minWidth: 16,
                      height: '100%'
                    }}
                  >
                    &nbsp;{/* Indent */}
                  </div>
                );
              })
            : null}
          <div
            onClick={handleClick}
            onContextMenu={handleRightClick}
            onDoubleClick={handleDoubleClick}
            className="flex flex-grow items-center h-full overflow-hidden"
            style={{
              paddingLeft: 8
            }}
          >
            <div>
              {isFolder ? (
                <IconChevronRight
                  size={16}
                  strokeWidth={2}
                  className={iconClassName}
                  style={{ color: 'rgb(160 160 160)' }}
                />
              ) : null}
            </div>

            <div className="ml-1 flex items-center overflow-hidden">
              <RequestMethod item={item} />
              <span className="item-name" title={item.name}>
                {item.name}
              </span>
            </div>
          </div>
          <div className="menu-icon pr-2">
            {isFolder ? (
              <FolderMenu collection={collection} item={item} />
            ) : (
              <RequestMenu collection={collection} item={item} />
            )}
          </div>
        </div>
      </div>

      {!itemIsCollapsed ? (
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
    </StyledWrapper>
  );
};

export default CollectionItem;
