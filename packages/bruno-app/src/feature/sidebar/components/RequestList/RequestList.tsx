/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React from 'react';
import { useRequestList } from '../../hooks/useRequestList';
import { CollectionItem } from './CollectionItem';
import { RequestItem } from './RequestItem';
import { FolderItem } from './FolderItem';

export const RequestList: React.FC = () => {
  const items = useRequestList();

  return items.map((item) => {
    // Folder and requests keys include their parent ids, because after moving a request / folder
    // The old and the new request and shortly in the store at the same time and rendered at the same time
    // This throws an React duplicate key error and leave a "ghost" item behind
    switch (item.type) {
      case 'collection':
        return <CollectionItem {...item} key={item.uid} />;
      case 'folder':
        return <FolderItem {...item} key={item.uid + item.parentUid} />;
      case 'request':
        return <RequestItem {...item} key={item.uid + item.parentUid} />;
      default:
        // @ts-expect-error
        return <div>Unknown type {item.type}</div>;
    }
  });
};
