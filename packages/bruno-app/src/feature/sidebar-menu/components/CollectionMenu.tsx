/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
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
import { useSidebarActions } from '../hooks/useSidebarActions';

const ICON_STYLE = { width: rem(16), height: rem(16) };

type CollectionMenuProps = {
  collectionUid: string;
  onChange: () => void;
  opened: boolean,
};

export const CollectionMenu: React.FC<CollectionMenuProps> = ({ collectionUid, ...menuProps }) => {
  const { setActiveAction, openRunner, openInExplorer, editBrunoJson, openCollectionSettings } = useSidebarActions();

  return (
    <Menu offset={2} {...menuProps}>
      <Menu.Target>
        <ActionIcon variant={'transparent'} color={'gray'}>
          <IconDots style={{ width: 22, height: 22 }} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconPlus style={ICON_STYLE} />}
          onClick={() => setActiveAction('new-request', collectionUid)}
        >
          New request
        </Menu.Item>

        <Menu.Item
          leftSection={<IconFolderPlus style={ICON_STYLE} />}
          onClick={() => setActiveAction('new-folder', collectionUid)}
        >
          New folder
        </Menu.Item>

        <Menu.Item
          leftSection={<IconPencil style={ICON_STYLE} />}
          onClick={() => setActiveAction('rename-collection', collectionUid)}
        >
          Rename
        </Menu.Item>

        <Menu.Item
          leftSection={<IconCopy style={ICON_STYLE} />}
          onClick={() => setActiveAction('clone-collection', collectionUid)}
        >
          Clone
        </Menu.Item>

        <Menu.Item
          c={'red'}
          leftSection={<IconMinimize style={ICON_STYLE} />}
          onClick={() => setActiveAction('close-collection', collectionUid)}
        >
          Close
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item leftSection={<IconRun style={ICON_STYLE} />} onClick={() => openRunner(collectionUid)}>
          Run
        </Menu.Item>

        <Menu.Item
          leftSection={<IconSettings style={ICON_STYLE} />}
          onClick={() => openCollectionSettings(collectionUid)}
        >
          Collection settings
        </Menu.Item>

        <Menu.Item
          leftSection={<IconFileExport style={ICON_STYLE} />}
          onClick={() => setActiveAction('export-collection', collectionUid)}
        >
          Export
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item leftSection={<IconFolderOpen style={ICON_STYLE} />} onClick={() => openInExplorer(collectionUid)}>
          Open in Explorer
        </Menu.Item>

        <Menu.Item leftSection={<IconEdit style={ICON_STYLE} />} onClick={() => editBrunoJson(collectionUid)}>
          Edit bruno.json
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
