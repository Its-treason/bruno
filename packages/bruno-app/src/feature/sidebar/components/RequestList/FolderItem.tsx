/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { IconChevronDown } from '@tabler/icons-react';
import { RequestItemWrapper } from './RequestItemWrapper';
import classes from './Item.module.scss';
import { CSSProperties } from 'react';

type FolderItemProps = {
  type: 'folder';
  name: string;
  uid: string;
  collectionUid: string;
  collapsed: boolean;
  indent: number;
  style: CSSProperties;
};

export const FolderItem: React.FC<FolderItemProps> = ({ collapsed, name, type, uid, collectionUid, indent, style }) => {
  return (
    <RequestItemWrapper
      uid={uid}
      collectionUid={collectionUid}
      type={type}
      indent={indent}
      className={classes.wrapper}
      style={style}
    >
      <IconChevronDown className={classes.icon} data-collapsed={collapsed} />
      <div className={classes.text}>{name}</div>
    </RequestItemWrapper>
  );
};
