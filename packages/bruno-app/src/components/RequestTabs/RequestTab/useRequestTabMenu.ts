/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { CollectionSchema } from '@usebruno/schema';
import { saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import { closeTabs } from 'providers/ReduxStore/slices/tabs';
import { MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { flattenItems } from 'utils/collections';

export const useRequestTabMenu = (collection: CollectionSchema, tabIndex: number, collectionRequestTabs: any[]) => {
  const dispatch = useDispatch();

  async function saveAndCloseTabs(tabUids: string[]) {
    // Close tabs before saving, because this makes the UI look faster and saves the request in background
    dispatch(closeTabs({ tabUids }));

    const flattenedItems = flattenItems(collection.items);

    for (const tabId of tabUids) {
      const item = flattenedItems.find((item) => item.uid === tabId);
      if (item && item.draft) {
        try {
          await dispatch(saveRequest(item.uid, collection.uid, true));
        } catch (error) {
          console.error('Could not save request in TabMenuCallback!', item, error);
        }
      }
    }
  }

  function onClose(itemUid: string, evt: MouseEvent) {
    // Important so the now closed tab is not focused
    evt.stopPropagation();

    saveAndCloseTabs([itemUid]);
  }

  function onCloseOthers(evt: MouseEvent) {
    evt.stopPropagation();
    const otherTabsUid = collectionRequestTabs.filter((_, index) => index !== tabIndex).map((t) => t.uid);
    saveAndCloseTabs(otherTabsUid);
  }

  function onCloseToTheLeft(evt: MouseEvent) {
    evt.stopPropagation();
    const leftTabUids = collectionRequestTabs.filter((_, index) => index < tabIndex).map((t) => t.uid);
    saveAndCloseTabs(leftTabUids);
  }

  function onCloseToTheRight(evt: MouseEvent) {
    evt.stopPropagation();
    const rightTabUids = collectionRequestTabs.filter((_, index) => index > tabIndex).map((t) => t.uid);
    saveAndCloseTabs(rightTabUids);
  }

  function onCloseSaved(evt: MouseEvent) {
    evt.stopPropagation();
    const savedTabUids = flattenItems(collection.items)
      .filter((item) => !item.draft)
      .map((t) => t.uid);
    saveAndCloseTabs(savedTabUids);
  }

  function onCloseAll(evt: MouseEvent) {
    evt.stopPropagation();

    const allTabUids = collectionRequestTabs.map((tab) => tab.uid);
    saveAndCloseTabs(allTabUids);
  }

  return {
    onClose,
    onCloseOthers,
    onCloseToTheLeft,
    onCloseToTheRight,
    onCloseSaved,
    onCloseAll
  };
};
