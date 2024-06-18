/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React, { CSSProperties, ReactNode, useMemo, useState } from 'react';
import classes from './RequestItemWrapper.module.scss';
import { CollectionMenu, FolderMenu, RequestMenu } from 'src/feature/sidebar-menu';
import { useSidebarActions } from 'src/feature/sidebar-menu/hooks/useSidebarActions';
import { useDrag, useDrop } from 'react-dnd';
import { useDispatch } from 'react-redux';
import { moveItem } from 'providers/ReduxStore/slices/collections/actions';

type RequestItemWrapperProps = {
  uid?: string;
  collectionUid: string;
  children: ReactNode;
  type: 'collection' | 'request' | 'folder';
  indent: number;
  className?: string;
  active?: boolean;
  style?: CSSProperties;
};

export const RequestItemWrapper: React.FC<RequestItemWrapperProps> = ({
  uid,
  collectionUid,
  children,
  type,
  indent,
  className,
  active = false,
  style
}) => {
  const dispatch = useDispatch();
  const { itemClicked } = useSidebarActions();
  const [hover, setHover] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);

  const menu = useMemo(() => {
    const onOpen = () => setMenuOpened(true);
    const onClose = () => setMenuOpened(false);
    switch (type) {
      case 'collection':
        return <CollectionMenu collectionUid={collectionUid} onClose={onClose} onOpen={onOpen} />;
      case 'request':
        return <RequestMenu collectionUid={collectionUid} itemUid={uid!} onClose={onClose} onOpen={onOpen} />;
      case 'folder':
        return <FolderMenu collectionUid={collectionUid} itemUid={uid!} onClose={onClose} onOpen={onOpen} />;
    }
  }, [type]);

  const [, drag] = useDrag({
    type: `COLLECTION_ITEM_${collectionUid}`,
    item: { uid: uid ?? collectionUid },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [{ isOverCurrent }, drop] = useDrop({
    accept: `COLLECTION_ITEM_${collectionUid}`,
    // Defined in useDrag
    drop: (draggedItem: { uid: string }) => {
      if (draggedItem.uid !== uid && draggedItem.uid !== collectionUid && uid) {
        dispatch(moveItem(collectionUid, draggedItem.uid, uid));
      }
    },
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver({ shallow: true })
    })
  });

  return (
    <div
      role="button"
      className={classes.box}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => itemClicked(collectionUid, uid)}
      data-active={active}
      data-drop-hovered={isOverCurrent && type === 'request'}
      ref={(ref) => drag(drop(ref))}
      style={style}
    >
      <div style={{ paddingLeft: indent * 24 }} className={className}>
        {children}
      </div>
      <div onClick={(evt) => evt.stopPropagation()}>{hover || menuOpened ? menu : null}</div>
    </div>
  );
};
