/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Menu, rem } from '@mantine/core';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import React, { ReactNode, useMemo, useState } from 'react';
import { useRequestTabMenu } from './useRequestTabMenu';
import { NewRequestModal } from 'src/feature/sidebar-menu/components/modals/NewRequestModal';
import { CloneItemModal } from 'src/feature/sidebar-menu/components/modals/CloneItemModal';
import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowsLeftRight,
  IconCopy,
  IconMinimize,
  IconPencil,
  IconPlus,
  IconSquareRoundedX,
  IconTrash,
  IconX
} from '@tabler/icons-react';
import { RenameItemModal } from 'src/feature/sidebar-menu/components/modals/RenameItemModal';
import { DeleteItemModal } from 'src/feature/sidebar-menu/components/modals/DeleteItemModal';
import { findParentItemInCollection } from 'utils/collections';

const ICON_STYLE = { width: rem(16), height: rem(16) };

type RequestTabMenuProps = {
  children: ReactNode;
  collection: CollectionSchema;
  collectionRequestTabs: any[];
  tabIndex: number;
  item: RequestItemSchema;
  opened: boolean;
  onClose: () => void;
};

export const RequestTabMenu: React.FC<RequestTabMenuProps> = ({
  children,
  collection,
  item,
  collectionRequestTabs = [],
  tabIndex,
  opened,
  onClose
}) => {
  const [renameModalOpened, setRenameModalOpened] = useState(false);
  const [cloneModalOpened, setCloneModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [newRequestModalOpened, setNewRequestModalOpened] = useState(false);
  const callbacks = useRequestTabMenu(collection, tabIndex, collectionRequestTabs);

  const totalTabs = collectionRequestTabs.length;
  const hasLeftTabs = tabIndex !== 0;
  const hasRightTabs = totalTabs > tabIndex + 1;
  const hasOtherTabs = totalTabs > 1;

  const parentUid = useMemo(() => {
    // Finding the parent is expensive so doing it on every render would be shit
    if (!newRequestModalOpened) {
      return null;
    }
    return findParentItemInCollection(collection, item.uid)?.uid;
  }, [newRequestModalOpened, item.uid]);

  return (
    <Menu shadow="md" opened={opened} onClose={onClose} position="bottom-start" offset={4}>
      <NewRequestModal
        onClose={() => setNewRequestModalOpened(false)}
        opened={newRequestModalOpened}
        brunoConfig={collection?.brunoConfig}
        collectionUid={collection.uid}
        itemUid={parentUid}
      />

      <CloneItemModal
        onClose={() => setCloneModalOpened(false)}
        opened={cloneModalOpened}
        collectionUid={collection.uid}
        item={item}
      />

      <RenameItemModal
        onClose={() => setRenameModalOpened(false)}
        opened={renameModalOpened}
        collectionUid={collection.uid}
        item={item}
      />

      <DeleteItemModal
        onClose={() => setDeleteModalOpened(false)}
        opened={deleteModalOpened}
        collectionUid={collection.uid}
        item={item}
      />

      <Menu.Target>{children}</Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          onClick={(evt) => callbacks.onClose(item.uid, evt)}
          leftSection={<IconMinimize style={ICON_STYLE} />}
        >
          Close
        </Menu.Item>

        <Menu.Item
          onClick={callbacks.onCloseOthers}
          disabled={!hasOtherTabs}
          leftSection={<IconArrowsLeftRight style={ICON_STYLE} />}
        >
          Close others
        </Menu.Item>

        <Menu.Item
          onClick={callbacks.onCloseToTheLeft}
          disabled={!hasLeftTabs}
          leftSection={<IconArrowLeft style={ICON_STYLE} />}
        >
          Close to the left
        </Menu.Item>

        <Menu.Item
          onClick={callbacks.onCloseToTheRight}
          disabled={!hasRightTabs}
          leftSection={<IconArrowRight style={ICON_STYLE} />}
        >
          Close to the right
        </Menu.Item>

        <Menu.Item onClick={callbacks.onCloseSaved} leftSection={<IconSquareRoundedX style={ICON_STYLE} />}>
          Close saved
        </Menu.Item>

        <Menu.Item onClick={callbacks.onCloseAll} leftSection={<IconX style={ICON_STYLE} />}>
          Close all
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item onClick={() => setRenameModalOpened(true)} leftSection={<IconPencil style={ICON_STYLE} />}>
          Rename
        </Menu.Item>

        <Menu.Item onClick={() => setCloneModalOpened(true)} leftSection={<IconCopy style={ICON_STYLE} />}>
          Clone
        </Menu.Item>

        <Menu.Item onClick={() => setDeleteModalOpened(true)} leftSection={<IconTrash style={ICON_STYLE} />} c={'red'}>
          Delete
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item onClick={() => setNewRequestModalOpened(true)} leftSection={<IconPlus style={ICON_STYLE} />}>
          New request
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
