/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
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
import React from 'react';
import { useSidebarActions } from '../hooks/useSidebarActions';

const ICON_STYLE = { width: rem(18), height: rem(18) };

type FolderMenuProps = {
  collectionUid: string;
  itemUid: string;
  onOpen: () => void;
  onClose: () => void;
};

export const FolderMenu: React.FC<FolderMenuProps> = ({ collectionUid, itemUid, onClose, onOpen }) => {
  const { setActiveAction, openRunner, openInExplorer } = useSidebarActions();

  return (
    <Menu offset={2} onOpen={onOpen} onClose={onClose}>
      <Menu.Target>
        <ActionIcon variant={'transparent'} color={'gray'}>
          <IconDots style={{ width: 22, height: 22 }} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconPlus style={ICON_STYLE} />}
          onClick={() => setActiveAction('new-request', collectionUid, itemUid)}
        >
          New Request
        </Menu.Item>

        <Menu.Item
          leftSection={<IconFolderPlus style={ICON_STYLE} />}
          onClick={() => setActiveAction('new-folder', collectionUid, itemUid)}
        >
          New Folder
        </Menu.Item>

        <Menu.Item
          leftSection={<IconPencil style={ICON_STYLE} />}
          onClick={() => setActiveAction('rename', collectionUid, itemUid)}
        >
          Rename
        </Menu.Item>

        <Menu.Item
          leftSection={<IconCopy style={ICON_STYLE} />}
          onClick={() => setActiveAction('clone', collectionUid, itemUid)}
        >
          Clone
        </Menu.Item>

        <Menu.Item
          c={'red'}
          leftSection={<IconTrash style={ICON_STYLE} />}
          onClick={() => setActiveAction('delete', collectionUid, itemUid)}
        >
          Delete
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item leftSection={<IconRun style={ICON_STYLE} />} onClick={() => openRunner(collectionUid)}>
          Run
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          leftSection={<IconFolderOpen style={ICON_STYLE} />}
          onClick={() => openInExplorer(collectionUid, itemUid)}
        >
          Open in Explorer
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
