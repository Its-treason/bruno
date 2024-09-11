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

const RequestTab = ({ tab, collection, tabIndex, collectionRequestTabs, folderUid }) => {
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
            <SpecialTab handleCloseClick={handleCloseClick} type={tab.type} tabName={folder?.name} />
          ) : (
            <SpecialTab handleCloseClick={handleCloseClick} type={tab.type} />
          )}
        </StyledWrapper>
      </RequestTabMenu>
    );
  }

  const item = useMemo(() => {
    return findItemInCollection(collection, tab.uid);
  }, [tab.uid]);

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
          <RequestMethodIcon method={method} />
          <span className="ml-1 tab-name" title={item.name}>
            {item.name}
          </span>
        </div>
        <div
          className="flex px-2 close-icon-container"
          onClick={(e) => {
            if (!item.draft) return handleCloseClick(e);

            e.stopPropagation();
            e.preventDefault();
            setShowConfirmClose(true);
          }}
        >
          {!item.draft ? (
            <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="close-icon">
              <path
                fill="currentColor"
                d="M207.6 256l107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z"
              ></path>
            </svg>
          ) : (
            <svg
              focusable="false"
              xmlns="http://www.w3.org/2000/svg"
              width="8"
              height="16"
              fill="#cc7b1b"
              className="has-changes-icon"
              viewBox="0 0 8 8"
            >
              <circle cx="4" cy="4" r="3" />
            </svg>
          )}
        </div>
      </StyledWrapper>
    </RequestTabMenu>
  );
};

export default RequestTab;
