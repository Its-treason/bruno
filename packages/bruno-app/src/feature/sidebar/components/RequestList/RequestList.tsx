/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React from 'react';
import { useRequestList } from '../../hooks/useRequestList';
import { CollectionItem } from './CollectionItem';
import { RequestItem } from './RequestItem';
import { FolderItem } from './FolderItem';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { RequestListItem } from '../../types/requestList';
import AutoSizer from 'react-virtualized-auto-sizer';

const Row: React.FC<ListChildComponentProps<RequestListItem[]>> = ({ index, style, data }) => {
  const item = data[index];
  if (!item) {
    return null;
  }

  switch (item.type) {
    case 'collection':
      return <CollectionItem {...item} style={style} key={item.uid} />;
    case 'folder':
      return <FolderItem {...item} style={style} key={item.uid + item.parentUid} />;
    case 'request':
      return <RequestItem {...item} style={style} key={item.uid + item.parentUid} />;
    default:
      // @ts-expect-error
      return <div>Unknown type {item.type}</div>;
  }
};

export const RequestList: React.FC = () => {
  const items = useRequestList();

  return (
    <AutoSizer>
      {({ height, width }) => (
        <FixedSizeList
          overscanCount={10}
          height={height}
          width={width - 1}
          itemCount={items.length}
          itemSize={36}
          itemData={items}
        >
          {Row}
        </FixedSizeList>
      )}
    </AutoSizer>
  );
};
