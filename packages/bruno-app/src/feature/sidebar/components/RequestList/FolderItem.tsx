/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { IconChevronDown } from '@tabler/icons-react';
import { RequestItemWrapper } from './RequestItemWrapper';
import classes from './Item.module.scss';

type FolderItemProps = {
  type: 'folder';
  name: string;
  uid: string;
  collectionUid: string;
  collapsed: boolean;
  indent: number;
};

export const FolderItem: React.FC<FolderItemProps> = ({ collapsed, name, type, uid, collectionUid, indent }) => {
  return (
    <RequestItemWrapper uid={uid} collectionUid={collectionUid} type={type} indent={indent} className={classes.wrapper}>
      <IconChevronDown className={classes.icon} data-collapsed={collapsed} />
      <div className={classes.text}>{name}</div>
    </RequestItemWrapper>
  );
};
