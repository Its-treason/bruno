/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { IconChevronDown } from '@tabler/icons-react';
import { RequestItemWrapper } from './RequestItemWrapper';
import classes from './Item.module.scss';
import { CSSProperties } from 'react';
import { ActionIcon } from '@mantine/core';
import { useSidebarActions } from 'feature/sidebar-menu';

type FolderItemProps = {
  type: 'folder';
  name: string;
  uid: string;
  collectionUid: string;
  collapsed: boolean;
  indent: number;
  active?: boolean;
  style: CSSProperties;
};

export const FolderItem: React.FC<FolderItemProps> = ({
  collapsed,
  name,
  type,
  uid,
  collectionUid,
  indent,
  style,
  active
}) => {
  const { itemClicked } = useSidebarActions();

  return (
    <RequestItemWrapper
      uid={uid}
      collectionUid={collectionUid}
      type={type}
      indent={indent}
      className={classes.wrapper}
      style={style}
      collapsed={collapsed}
      toggleFolders={false}
      active={active}
    >
      <ActionIcon
        variant="transparent"
        onClick={(evt) => {
          evt.stopPropagation();
          itemClicked(collectionUid, uid, true);
        }}
        color="white"
      >
        <IconChevronDown className={classes.icon} data-collapsed={collapsed} />
      </ActionIcon>
      <div className={classes.text}>{name}</div>
    </RequestItemWrapper>
  );
};
