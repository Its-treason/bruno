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

type CollectionItemProps = {
  type: 'collection';
  name: string;
  uid: string;
  collapsed: boolean;
  active?: boolean;
  style: CSSProperties;
};

export const CollectionItem: React.FC<CollectionItemProps> = ({
  collapsed,
  name,
  type,
  uid: collectionUid,
  style,
  active
}) => {
  const { itemClicked } = useSidebarActions();

  return (
    <RequestItemWrapper
      collectionUid={collectionUid}
      type={type}
      indent={0}
      className={classes.wrapper}
      style={style}
      active={active}
      toggleFolders={false}
    >
      <ActionIcon
        variant="transparent"
        onClick={(evt) => {
          evt.stopPropagation();
          itemClicked(collectionUid, undefined, true);
        }}
        color="white"
      >
        <IconChevronDown className={classes.icon} data-collapsed={collapsed} />
      </ActionIcon>
      <div className={classes.text}>
        <b>{name}</b>
      </div>
    </RequestItemWrapper>
  );
};
