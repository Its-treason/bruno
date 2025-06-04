/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React, { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import classes from './RequestItemWrapper.module.scss';
import { CollectionMenu, FolderMenu, RequestMenu } from 'src/feature/sidebar-menu';
import { useSidebarActions } from 'src/feature/sidebar-menu/hooks/useSidebarActions';
import { useDrag, useDrop } from 'react-dnd';
import { useDispatch } from 'react-redux';
import {
  changeCollectionOrder,
  moveItem,
  moveItemToRootOfCollection
} from 'providers/ReduxStore/slices/collections/actions';
import { DropIndicatorPositions, getDropIndicator } from '../../util/dragAndDropUtils';

type SidebarDragItem = { uid: string; type: 'item' | 'collection' };

type RequestItemWrapperProps = {
  uid?: string;
  collectionUid: string;
  children: ReactNode;
  type: 'collection' | 'request' | 'folder';
  indent: number;
  className?: string;
  active?: boolean;
  collapsed?: boolean;
  toggleFolders?: boolean;
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
  collapsed = true,
  toggleFolders,
  style
}) => {
  const dispatch = useDispatch();
  const { itemClicked, setActiveAction } = useSidebarActions();
  const [hover, setHover] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const menu = useMemo(() => {
    const menuProps = {
      onChange: () => setMenuOpened(!menuOpened),
      opened: menuOpened
    } as const;
    switch (type) {
      case 'collection':
        return <CollectionMenu collectionUid={collectionUid} {...menuProps} />;
      case 'request':
        return <RequestMenu collectionUid={collectionUid} itemUid={uid} {...menuProps} />;
      case 'folder':
        return <FolderMenu collectionUid={collectionUid} itemUid={uid} {...menuProps} />;
    }
  }, [type, menuOpened]);

  const [, drag] = useDrag<SidebarDragItem>({
    type: uid ? `COLLECTION_ITEM_${collectionUid}` : 'COLLECTION',
    item: { uid: uid ?? collectionUid, type: uid ? 'item' : 'collection' }
  });

  const [{ isOverCurrent }, drop] = useDrop<SidebarDragItem, unknown, { isOverCurrent: boolean }>({
    accept: uid ? [`COLLECTION_ITEM_${collectionUid}`] : [`COLLECTION_ITEM_${collectionUid}`, 'COLLECTION'],
    drop: (draggedItem) => {
      if (draggedItem.type === 'collection' && draggedItem.uid !== collectionUid) {
        dispatch(changeCollectionOrder(draggedItem.uid, collectionUid));
        return;
      }

      if (draggedItem.uid !== uid && draggedItem.uid !== collectionUid) {
        if (uid) {
          const operation = wrapperRef.current.dataset.dropIndicator as DropIndicatorPositions;
          dispatch(moveItem(collectionUid, draggedItem.uid, uid, operation));
        } else {
          dispatch(moveItemToRootOfCollection(collectionUid, draggedItem.uid));
        }
      }
    },
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver({ shallow: true })
    })
  });

  useEffect(() => {
    if (!isOverCurrent || !wrapperRef.current) {
      return;
    }

    const listener = (evt: MouseEvent) => {
      wrapperRef.current.dataset.dropIndicator = getDropIndicator(wrapperRef.current, evt, type);
    };
    document.addEventListener('dragover', listener);
    return () => {
      document.removeEventListener('dragover', listener);
      if (wrapperRef.current) {
        wrapperRef.current.dataset.dropIndicator = 'none';
      }
    };
  }, [isOverCurrent]);

  useEffect(() => {
    // Open a folder that is hovered while dragging
    if (!isOverCurrent || type !== 'folder' || !collapsed) {
      return;
    }
    const timeoutRef = setTimeout(() => {
      itemClicked(collectionUid, uid);
    }, 1000);
    return () => {
      clearTimeout(timeoutRef);
    };
  }, [isOverCurrent]);

  return (
    <div
      role="button"
      className={classes.box}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => itemClicked(collectionUid, uid, toggleFolders)}
      onContextMenu={() => setMenuOpened(!menuOpened)}
      onDoubleClick={() => {
        if (uid) {
          setActiveAction('rename', collectionUid, uid);
        }
      }}
      data-active={active}
      data-drop-indicator={'none'}
      ref={(ref) => {
        drag(drop(ref));
        wrapperRef.current = ref;
      }}
      style={{ ...style, '--indent': `${indent * 24}px` } as CSSProperties}
    >
      <div className={className}>{children}</div>
      <div onClick={(evt) => evt.stopPropagation()}>{hover || menuOpened ? menu : null}</div>
    </div>
  );
};
