/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { RequestItemWrapper } from './RequestItemWrapper';
import classes from './Item.module.scss';
import { CSSProperties } from 'react';
import { RequestItemMethodIcon } from 'components/RequestItemMethodIcon';

type RequestItemProps = {
  type: 'request';
  name: string;
  uid: string;
  collectionUid: string;
  method: string;
  indent: number;
  active: boolean;
  style: CSSProperties;
};

export const RequestItem: React.FC<RequestItemProps> = ({
  name,
  type,
  uid,
  collectionUid,
  indent,
  method,
  active,
  style
}) => {
  return (
    <RequestItemWrapper
      uid={uid}
      collectionUid={collectionUid}
      type={type}
      indent={indent}
      className={classes.wrapper}
      active={active}
      style={style}
    >
      <RequestItemMethodIcon method={method} />
      <div className={classes.text}>{name}</div>
    </RequestItemWrapper>
  );
};
