/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Menu, Modal, rem } from '@mantine/core';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import React, { ReactNode, useMemo, useState } from 'react';
import { useRequestTabMenu } from './useRequestTabMenu';
import { NewRequestModalContent } from 'src/feature/sidebar-menu/components/modalContent/NewRequestModalContent';
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
import { RenameItemModalContent } from 'src/feature/sidebar-menu/components/modalContent/RenameItemModalContent';
import { findParentItemInCollection } from 'utils/collections';
import { DeleteItemModalContent } from 'src/feature/sidebar-menu/components/modalContent/DeleteItemModalContent';
import { CloneItemModalContent } from 'src/feature/sidebar-menu/components/modalContent/CloneItemModalContent';

const ICON_STYLE = { width: rem(16), height: rem(16) };

type RequestTabMenuProps = {
  children: ReactNode;
  collection: CollectionSchema;
  collectionRequestTabs: any[];
  tabIndex: number;
  item?: RequestItemSchema;
  opened: boolean;
  onClose: () => void;
};

export const RequestTabMenu: React.FC<RequestTabMenuProps> = ({
  children,
  collection,
  item = null,
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
    if (item?.type === 'folder') {
      return item.uid;
    }

    // Finding the parent is expensive so doing it on every render would be shit
    if (!newRequestModalOpened || !item) {
      return null;
    }
    return findParentItemInCollection(collection, item.uid)?.uid;
  }, [newRequestModalOpened, item?.uid]);

  return (
    <Menu shadow="md" opened={opened} onClose={onClose} position="bottom-start" offset={4}>
      {item ? (
        <>
          <Modal opened={newRequestModalOpened} onClose={() => setNewRequestModalOpened(false)}>
            <NewRequestModalContent
              onClose={() => setNewRequestModalOpened(false)}
              brunoConfig={collection?.brunoConfig}
              collectionUid={collection.uid}
              itemUid={parentUid}
            />
          </Modal>

          <Modal opened={cloneModalOpened} onClose={() => setCloneModalOpened(false)}>
            <CloneItemModalContent
              onClose={() => setCloneModalOpened(false)}
              collectionUid={collection.uid}
              item={item}
            />
          </Modal>

          <Modal opened={renameModalOpened} onClose={() => setRenameModalOpened(false)}>
            <RenameItemModalContent
              onClose={() => setRenameModalOpened(false)}
              collectionUid={collection.uid}
              item={item}
            />
          </Modal>

          <Modal opened={deleteModalOpened} onClose={() => setDeleteModalOpened(false)}>
            <DeleteItemModalContent
              onClose={() => setDeleteModalOpened(false)}
              collectionUid={collection.uid}
              item={item}
            />
          </Modal>
        </>
      ) : null}

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

        {item ? (
          <>
            <Menu.Divider />

            <Menu.Item onClick={() => setRenameModalOpened(true)} leftSection={<IconPencil style={ICON_STYLE} />}>
              Rename
            </Menu.Item>

            <Menu.Item onClick={() => setCloneModalOpened(true)} leftSection={<IconCopy style={ICON_STYLE} />}>
              Clone
            </Menu.Item>

            <Menu.Item
              onClick={() => setDeleteModalOpened(true)}
              leftSection={<IconTrash style={ICON_STYLE} />}
              c={'red'}
            >
              Delete
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item onClick={() => setNewRequestModalOpened(true)} leftSection={<IconPlus style={ICON_STYLE} />}>
              New request
            </Menu.Item>
          </>
        ) : null}
      </Menu.Dropdown>
    </Menu>
  );
};
