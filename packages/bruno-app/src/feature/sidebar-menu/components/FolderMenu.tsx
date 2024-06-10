import { ActionIcon, Menu, rem } from '@mantine/core';
import {
  IconCopy,
  IconDots,
  IconFolderOpen,
  IconFolderPlus,
  IconPencil,
  IconPlus,
  IconRun,
  IconTrash
} from '@tabler/icons-react';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import React from 'react';
import { NewRequestModal } from './modals/NewRequestModal';
import { useFolderMenu } from '../hooks/useFolderMenu';
import { NewFolderModal } from './modals/NewFolderModal';
import { RenameItemModal } from './modals/RenameItemModal';
import { CloneItemModal } from './modals/CloneItemModal';
import { DeleteItemModal } from './modals/DeleteItemModal';

const ICON_STYLE = { width: rem(18), height: rem(18) };

type FolderMenuProps = {
  openRenameModal: boolean;
  collection: CollectionSchema;
  item: RequestItemSchema;
};

export const FolderMenu: React.FC<FolderMenuProps> = ({ collection, item, openRenameModal }) => {
  const { activeModal, setActiveModal, onOpenInExplorer, onRun } = useFolderMenu(collection.uid, item);

  return (
    <Menu>
      <NewRequestModal
        brunoConfig={collection.brunoConfig}
        collectionUid={collection.uid}
        onClose={() => setActiveModal(null)}
        opened={activeModal === 'new-request'}
        itemUid={item.uid}
      />
      <NewFolderModal
        collectionUid={collection.uid}
        onClose={() => setActiveModal(null)}
        opened={activeModal === 'new-folder'}
        itemUid={item.uid}
      />
      <RenameItemModal
        collectionUid={collection.uid}
        onClose={() => setActiveModal(null)}
        opened={activeModal === 'rename'}
        item={item}
      />
      <CloneItemModal
        onClose={() => setActiveModal(null)}
        opened={activeModal === 'clone'}
        item={item}
        collectionUid={collection.uid}
      />
      <DeleteItemModal
        onClose={() => setActiveModal(null)}
        opened={activeModal === 'delete'}
        item={item}
        collectionUid={collection.uid}
      />

      <Menu.Target>
        <ActionIcon variant={'transparent'} color={'gray'}>
          <IconDots style={ICON_STYLE} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item leftSection={<IconPlus style={ICON_STYLE} />} onClick={() => setActiveModal('new-request')}>
          New Request
        </Menu.Item>

        <Menu.Item leftSection={<IconFolderPlus style={ICON_STYLE} />} onClick={() => setActiveModal('new-folder')}>
          New Folder
        </Menu.Item>

        <Menu.Item leftSection={<IconPencil style={ICON_STYLE} />} onClick={() => setActiveModal('rename')}>
          Rename
        </Menu.Item>

        <Menu.Item leftSection={<IconCopy style={ICON_STYLE} />} onClick={() => setActiveModal('clone')}>
          Clone
        </Menu.Item>

        <Menu.Item c={'red'} leftSection={<IconTrash style={ICON_STYLE} />} onClick={() => setActiveModal('delete')}>
          Delete
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item leftSection={<IconRun style={ICON_STYLE} />} onClick={onRun}>
          Run
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item leftSection={<IconFolderOpen style={ICON_STYLE} />} onClick={onOpenInExplorer}>
          Open in Explorer
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
