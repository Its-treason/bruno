/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React, { memo } from 'react';
import { CollectionSchema } from '@usebruno/schema';
import { RequestListItem } from './RequestListeItem';

type RequestListProps = {
  items: string[];
  collection: CollectionSchema;
  onFocus: (item: string) => void;
};

export const RequestList: React.FC<RequestListProps> = memo(({ items, collection, onFocus }) => {
  return items.map((item) => <RequestListItem onFocus={onFocus} key={item} requestId={item} collection={collection} />);
});
