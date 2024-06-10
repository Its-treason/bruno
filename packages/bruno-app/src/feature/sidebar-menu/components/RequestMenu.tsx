import { ActionIcon, Menu, rem } from '@mantine/core';
import {
  IconCode,
  IconCopy,
  IconDots,
  IconEdit,
  IconFolderOpen,
  IconPencil,
  IconRun,
  IconTrash
} from '@tabler/icons-react';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import React from 'react';
import { useRequestMenu } from '../hooks/useRequestMenu';
import { RenameItemModal } from './modals/RenameItemModal';
import { CloneItemModal } from './modals/CloneItemModal';
import { DeleteItemModal } from './modals/DeleteItemModal';
import GenerateCodeItem from 'components/Sidebar/Collections/Collection/CollectionItem/GenerateCodeItem';

const ICON_STYLE = { width: rem(16), height: rem(16) };

type RequestMenuProps = {
  collection: CollectionSchema;
  item: RequestItemSchema;
};

export const RequestMenu: React.FC<RequestMenuProps> = ({ collection, item }) => {
  const { activeModal, setActiveModal, onOpenInEditor, onOpenInExplorer, onRun } = useRequestMenu(collection.uid, item);

  return (
    <Menu>
      <RenameItemModal
        collectionUid={collection.uid}
        onClose={() => setActiveModal(null)}
        opened={activeModal === 'rename'}
        item={item}
      />
      <CloneItemModal
        collectionUid={collection.uid}
        onClose={() => setActiveModal(null)}
        opened={activeModal === 'clone'}
        item={item}
      />
      <DeleteItemModal
        collectionUid={collection.uid}
        onClose={() => setActiveModal(null)}
        opened={activeModal === 'delete'}
        item={item}
      />

      {activeModal === 'generate' ? (
        <GenerateCodeItem collection={collection} onClose={() => setActiveModal(null)} item={item} />
      ) : null}

      <Menu.Target>
        <ActionIcon variant={'transparent'} color={'gray'}>
          <IconDots style={ICON_STYLE} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
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

        <Menu.Item leftSection={<IconCode style={ICON_STYLE} />} onClick={() => setActiveModal('generate')}>
          Generate code
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item leftSection={<IconFolderOpen style={ICON_STYLE} />} onClick={onOpenInExplorer}>
          Open in Explorer
        </Menu.Item>

        <Menu.Item leftSection={<IconEdit style={ICON_STYLE} />} onClick={onOpenInEditor}>
          Open in Editor
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
