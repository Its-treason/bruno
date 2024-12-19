/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React, { memo, useMemo } from 'react';
import { RunnerResultItem } from '../../types/runner';
import { CollectionSchema } from '@usebruno/schema';
import { RequestListItem } from './RequestListeItem';

type RequestListProps = {
  items: RunnerResultItem[];
  collection: CollectionSchema;
  onFocus: (item: RunnerResultItem) => void;
};

export const RequestList: React.FC<RequestListProps> = memo(({ items, collection, onFocus }) => {
  return items.map((item) => <RequestListItem onFocus={onFocus} key={item.uid} item={item} collection={collection} />);
});
