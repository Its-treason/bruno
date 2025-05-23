import React, { useState, useRef } from 'react';
import find from 'lodash/find';
import filter from 'lodash/filter';
import classnames from 'classnames';
import { IconChevronRight, IconChevronLeft } from '@tabler/icons-react';
import { useSelector, useDispatch } from 'react-redux';
import { focusTab, closeTabs } from 'providers/ReduxStore/slices/tabs';
import RequestTab from './RequestTab';
import StyledWrapper from './StyledWrapper';
import ConfirmRequestClose from './RequestTab/ConfirmRequestClose/index';
import { deleteRequestDraft } from 'providers/ReduxStore/slices/collections';
import { saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import { findItemInCollection } from 'utils/collections';
import get from 'lodash/get';
import { NewRequestModalContent } from 'src/feature/sidebar-menu/components/modalContent/NewRequestModalContent';
import { Modal } from '@mantine/core';

const RequestTabs = () => {
  const dispatch = useDispatch();
  const tabsRef = useRef();
  const [newRequestModalOpen, setNewRequestModalOpen] = useState(false);
  const tabs = useSelector((state) => state.tabs.tabs);
  const activeTabUid = useSelector((state) => state.tabs.activeTabUid);
  const collections = useSelector((state) => state.collections.collections);
  const leftSidebarWidth = useSelector((state) => state.app.leftSidebarWidth);
  const screenWidth = useSelector((state) => state.app.screenWidth);
  const hideTabs = useSelector((state) => get(state.app.preferences, 'hideTabs', false));
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [item, setItem] = useState(null);
  const [tab, setTab] = useState(null);
  const getTabClassname = (tab, index) => {
    return classnames('request-tab select-none', {
      active: tab.uid === activeTabUid,
      'last-tab': tabs && tabs.length && index === tabs.length - 1
    });
  };

  const handleClick = (tab) => {
    dispatch(
      focusTab({
        uid: tab.uid
      })
    );
  };

  const handleMouseUp = (e, tab) => {
    const item = findItemInCollection(activeCollection, tab.uid);
    setItem(item);
    setTab(tab);
    e.stopPropagation();
    e.preventDefault();

    if (e.button === 1) {
      if (item?.draft) return setShowConfirmClose(true);
      dispatch(
        closeTabs({
          tabUids: [tab.uid]
        })
      );
    }
  };

  const createNewTab = () => setNewRequestModalOpen(true);

  if (!activeTabUid) {
    return null;
  }

  const activeTab = find(tabs, (t) => t.uid === activeTabUid);
  if (!activeTab) {
    return <StyledWrapper>Something went wrong!</StyledWrapper>;
  }

  const activeCollection = find(collections, (c) => c.uid === activeTab.collectionUid);
  const collectionRequestTabs = filter(tabs, (t) => t.collectionUid === activeTab.collectionUid);

  const maxTablistWidth = screenWidth - leftSidebarWidth - 150;
  const tabsWidth = collectionRequestTabs.length * 150 + 34; // 34: (+)icon
  const showChevrons = maxTablistWidth < tabsWidth;

  const leftSlide = () => {
    tabsRef.current.scrollBy({
      left: -120,
      behavior: 'smooth'
    });
  };

  // todo: bring new tab to focus if its not in focus
  // tabsRef.current.scrollLeft

  const rightSlide = () => {
    tabsRef.current.scrollBy({
      left: 120,
      behavior: 'smooth'
    });
  };

  const getRootClassname = () => {
    return classnames({
      'has-chevrons': showChevrons
    });
  };

  return (
    <StyledWrapper className={getRootClassname()}>
      {showConfirmClose && (
        <ConfirmRequestClose
          item={item}
          onCancel={() => setShowConfirmClose(false)}
          onCloseWithoutSave={() => {
            dispatch(
              deleteRequestDraft({
                itemUid: item.uid,
                collectionUid: activeCollection.uid
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
            dispatch(saveRequest(item.uid, activeCollection.uid))
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
      <Modal opened={newRequestModalOpen} onClose={() => setNewRequestModalOpen(false)} title="New Request" size={'lg'}>
        <NewRequestModalContent
          brunoConfig={activeCollection.brunoConfig}
          collectionUid={activeCollection.uid}
          onClose={() => setNewRequestModalOpen(false)}
          opened={newRequestModalOpen}
        />
      </Modal>
      {collectionRequestTabs?.length && !hideTabs ? (
        <div className="flex items-center pl-4">
          <ul role="tablist">
            {showChevrons ? (
              <li className="select-none short-tab" onClick={leftSlide}>
                <div className="flex items-center">
                  <IconChevronLeft size={18} strokeWidth={1.5} />
                </div>
              </li>
            ) : null}
          </ul>
          <ul role="tablist" style={{ maxWidth: maxTablistWidth }} ref={tabsRef}>
            {collectionRequestTabs && collectionRequestTabs.length
              ? collectionRequestTabs.map((tab, index) => {
                  return (
                    <li
                      onMouseUp={(e) => handleMouseUp(e, tab)}
                      key={tab.uid}
                      className={getTabClassname(tab, index)}
                      role="tab"
                      onClick={() => handleClick(tab)}
                    >
                      <RequestTab
                        key={tab.uid}
                        tab={tab}
                        collection={activeCollection}
                        folderUid={tab.folderUid}
                        collectionRequestTabs={collectionRequestTabs}
                        tabIndex={index}
                        active={tab.uid === activeTabUid}
                      />
                    </li>
                  );
                })
              : null}
          </ul>

          <ul role="tablist">
            {showChevrons ? (
              <li className="select-none short-tab" onClick={rightSlide}>
                <div className="flex items-center">
                  <IconChevronRight size={18} strokeWidth={1.5} />
                </div>
              </li>
            ) : null}
            <li className="select-none short-tab" id="create-new-tab" onClick={createNewTab}>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                </svg>
              </div>
            </li>
            {/* Moved to post mvp */}
            {/* <li className="select-none new-tab choose-request">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                </svg>
              </div>
            </li> */}
          </ul>
        </div>
      ) : null}
    </StyledWrapper>
  );
};

export default RequestTabs;
