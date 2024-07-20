/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
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
import React from 'react';
import { useSidebarActions } from '../hooks/useSidebarActions';

const ICON_STYLE = { width: rem(16), height: rem(16) };

type RequestMenuProps = {
  collectionUid: string;
  itemUid: string;
  onChange: () => void;
  opened: boolean,
};

export const RequestMenu: React.FC<RequestMenuProps> = ({ collectionUid, itemUid, ...menuProps }) => {
  const { setActiveAction, runRequest, openInEditor, openInExplorer } = useSidebarActions();

  return (
    <Menu offset={2} {...menuProps}>
      <Menu.Target>
        <ActionIcon variant={'transparent'} color={'gray'}>
          <IconDots style={{ width: 22, height: 22 }} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
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

        <Menu.Item leftSection={<IconRun style={ICON_STYLE} />} onClick={() => runRequest(collectionUid, itemUid)}>
          Run
        </Menu.Item>

        <Menu.Item
          leftSection={<IconCode style={ICON_STYLE} />}
          onClick={() => setActiveAction('generate', collectionUid, itemUid)}
        >
          Generate code
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          leftSection={<IconFolderOpen style={ICON_STYLE} />}
          onClick={() => openInExplorer(collectionUid, itemUid)}
        >
          Open in Explorer
        </Menu.Item>

        <Menu.Item leftSection={<IconEdit style={ICON_STYLE} />} onClick={() => openInEditor(collectionUid, itemUid)}>
          Open in Editor
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
