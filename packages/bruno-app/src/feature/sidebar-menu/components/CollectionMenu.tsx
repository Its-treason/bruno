import { ActionIcon, Menu, rem } from '@mantine/core';
import {
  IconCopy,
  IconDots,
  IconEdit,
  IconFileExport,
  IconFolderOpen,
  IconFolderPlus,
  IconMinimize,
  IconPencil,
  IconPlus,
  IconRun,
  IconSettings
} from '@tabler/icons-react';
import React from 'react';
import { useCollectionMenu } from '../hooks/useCollectionMenu';
import { CloneCollectionModal } from './modals/CloneCollectionModal';
import { CollectionSchema } from '@usebruno/schema';
import { CloseCollectionModal } from './modals/CloseCollectionModal';
import { NewFolderModal } from './modals/NewFolderModal';
import { NewRequestModal } from './modals/NewRequestModal';
import { RenameCollectionModal } from './modals/RenameCollectionModal';
import { ExportCollectionModal } from './modals/ExportCollectionModal';

const ICON_STYLE = { width: rem(16), height: rem(16) };

type CollectionMenuProps = {
  collection: CollectionSchema;
};

export const CollectionMenu: React.FC<CollectionMenuProps> = ({ collection }) => {
  const { activeModal, setActiveModal, onEditBrunoJson, onOpenInExplorer, onOpenCollectionSettings, onRun } =
    useCollectionMenu(collection.uid, collection.pathname);

  return (
    <Menu>
      <CloneCollectionModal
        collection={collection}
        onClose={() => setActiveModal(null)}
        opened={activeModal === 'clone'}
      />
      <CloseCollectionModal
        collection={collection}
        onClose={() => setActiveModal(null)}
        opened={activeModal === 'close'}
      />
      <RenameCollectionModal
        collection={collection}
        onClose={() => setActiveModal(null)}
        opened={activeModal === 'rename'}
      />
      <NewFolderModal
        onClose={() => setActiveModal(null)}
        opened={activeModal === 'new-folder'}
        collectionUid={collection.uid}
        itemUid={null}
      />
      <NewRequestModal
        onClose={() => setActiveModal(null)}
        opened={activeModal === 'new-request'}
        brunoConfig={collection.brunoConfig}
        collectionUid={collection.uid}
        itemUid={null}
      />
      <ExportCollectionModal
        onClose={() => setActiveModal(null)}
        opened={activeModal === 'export'}
        collection={collection}
      />

      <Menu.Target>
        <ActionIcon variant={'transparent'} color={'gray'}>
          <IconDots style={ICON_STYLE} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item leftSection={<IconPlus style={ICON_STYLE} />} onClick={() => setActiveModal('new-request')}>
          New request
        </Menu.Item>

        <Menu.Item leftSection={<IconFolderPlus style={ICON_STYLE} />} onClick={() => setActiveModal('new-folder')}>
          New folder
        </Menu.Item>

        <Menu.Item leftSection={<IconPencil style={ICON_STYLE} />} onClick={() => setActiveModal('rename')}>
          Rename
        </Menu.Item>

        <Menu.Item leftSection={<IconCopy style={ICON_STYLE} />} onClick={() => setActiveModal('clone')}>
          Clone
        </Menu.Item>

        <Menu.Item c={'red'} leftSection={<IconMinimize style={ICON_STYLE} />} onClick={() => setActiveModal('close')}>
          Close
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item leftSection={<IconRun style={ICON_STYLE} />} onClick={onRun}>
          Run
        </Menu.Item>

        <Menu.Item leftSection={<IconSettings style={ICON_STYLE} />} onClick={onOpenCollectionSettings}>
          Collection settings
        </Menu.Item>

        <Menu.Item leftSection={<IconFileExport style={ICON_STYLE} />} onClick={() => setActiveModal('export')}>
          Export
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item leftSection={<IconFolderOpen style={ICON_STYLE} />} onClick={onOpenInExplorer}>
          Open in Explorer
        </Menu.Item>

        <Menu.Item leftSection={<IconEdit style={ICON_STYLE} />} onClick={onEditBrunoJson}>
          Edit bruno.json
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
