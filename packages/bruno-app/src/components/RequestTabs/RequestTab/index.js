import { useState, useMemo } from 'react';
import get from 'lodash/get';
import { closeTabs } from 'providers/ReduxStore/slices/tabs';
import { saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import { deleteRequestDraft } from 'providers/ReduxStore/slices/collections';
import { useDispatch } from 'react-redux';
import { findItemInCollection } from 'utils/collections';
import ConfirmRequestClose from './ConfirmRequestClose';
import RequestTabNotFound from './RequestTabNotFound';
import SpecialTab from './SpecialTab';
import StyledWrapper from './StyledWrapper';
import { RequestMethodIcon } from 'components/RequestMethodIcon';
import { RequestTabMenu } from './RequestTabMenu';
import { IconX } from '@tabler/icons-react';
import { Indicator } from '@mantine/core';

const RequestTab = ({ tab, collection, tabIndex, collectionRequestTabs, folderUid, active }) => {
  const dispatch = useDispatch();
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);

  const handleCloseClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    dispatch(
      closeTabs({
        tabUids: [tab.uid]
      })
    );
  };

  const handleRightClick = () => {
    setMenuOpened(!menuOpened);
  };

  const handleMouseUp = (e) => {
    if (e.button === 1) {
      e.preventDefault();
      e.stopPropagation();

      // Close the tab
      dispatch(
        closeTabs({
          tabUids: [tab.uid]
        })
      );
    }
  };

  const folder = useMemo(() => {
    return folderUid ? findItemInCollection(collection, folderUid) : null;
  }, [folderUid]);
  if (['collection-settings', 'folder-settings', 'variables', 'collection-runner'].includes(tab.type)) {
    console.log(folder);
    return (
      <RequestTabMenu
        collection={collection}
        collectionRequestTabs={collectionRequestTabs}
        tabIndex={tabIndex}
        item={folder}
        opened={menuOpened}
        onClose={() => setMenuOpened(false)}
      >
        <StyledWrapper
          onContextMenu={handleRightClick}
          onMouseUp={handleMouseUp}
          className="flex items-center justify-between tab-container px-1"
        >
          {tab.type === 'folder-settings' ? (
            !folder ? (
              <RequestTabNotFound handleCloseClick={handleCloseClick} />
            ) : (
              <SpecialTab handleCloseClick={handleCloseClick} type={tab.type} tabName={folder?.name} />
            )
          ) : (
            <SpecialTab handleCloseClick={handleCloseClick} type={tab.type} />
          )}
        </StyledWrapper>
      </RequestTabMenu>
    );
  }

  let item = useMemo(() => {
    return findItemInCollection(collection, tab.uid);
  }, [tab.uid, active]);
  // This is a workaround to ensure that item.draft is updated and the indicator shows correctly.
  // But this also ensures to every item is searched on every render
  if (active) {
    item = findItemInCollection(collection, tab.uid);
  }

  if (!item) {
    return (
      <RequestTabMenu
        collection={collection}
        collectionRequestTabs={collectionRequestTabs}
        tabIndex={tabIndex}
        opened={menuOpened}
        onClose={() => setMenuOpened(false)}
      >
        <StyledWrapper
          onContextMenu={handleRightClick}
          onMouseUp={handleMouseUp}
          className="flex items-center justify-between tab-container px-1"
        >
          <RequestTabNotFound handleCloseClick={handleCloseClick} />
        </StyledWrapper>
      </RequestTabMenu>
    );
  }

  const method = item.draft ? get(item, 'draft.request.method') : get(item, 'request.method');

  return (
    <RequestTabMenu
      collection={collection}
      collectionRequestTabs={collectionRequestTabs}
      item={item}
      tabIndex={tabIndex}
      opened={menuOpened}
      onClose={() => setMenuOpened(false)}
    >
      <StyledWrapper className="flex items-center justify-between tab-container px-1">
        {showConfirmClose && (
          <ConfirmRequestClose
            item={item}
            onCancel={() => setShowConfirmClose(false)}
            onCloseWithoutSave={() => {
              dispatch(
                deleteRequestDraft({
                  itemUid: item.uid,
                  collectionUid: collection.uid
                })
              );
              dispatch(
                closeTabs({
                  tabUids: [tab.uid]
                })
              );
              setShowConfirmClose(false);
            }}
            onSaveAndClose={() => {
              dispatch(saveRequest(item.uid, collection.uid))
                .then(() => {
                  dispatch(
                    closeTabs({
                      tabUids: [tab.uid]
                    })
                  );
                  setShowConfirmClose(false);
                })
                .catch((err) => {
                  console.log('err', err);
                });
            }}
          />
        )}
        <div
          className="flex items-center tab-label pl-2"
          onContextMenu={handleRightClick}
          onMouseUp={(e) => {
            if (!item.draft) return handleMouseUp(e);

            if (e.button === 1) {
              e.stopPropagation();
              e.preventDefault();
              setShowConfirmClose(true);
            }
          }}
        >
          <Indicator position="top-start" disabled={!item.draft} offset={1}>
            <RequestMethodIcon method={method} />
          </Indicator>
          <span className="ml-1 tab-name" title={item.name}>
            {item.name}
          </span>
        </div>
        <div
          className="flex close-icon-container"
          onClick={(e) => {
            if (!item.draft) return handleCloseClick(e);

            e.stopPropagation();
            e.preventDefault();
            setShowConfirmClose(true);
          }}
        >
          <IconX className="close-icon" />
        </div>
      </StyledWrapper>
    </RequestTabMenu>
  );
};

export default RequestTab;
