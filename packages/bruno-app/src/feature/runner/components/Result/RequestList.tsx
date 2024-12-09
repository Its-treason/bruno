import React from 'react';
import { RunnerResultItem } from '../../types/runner';
import { CollectionSchema } from '@usebruno/schema';
import { RequestListItem } from './RequestListeItem';

type RequestListProps = {
  items: RunnerResultItem[];
  collection: CollectionSchema;
  onFocus: (item: RunnerResultItem) => void;
};

export const RequestList: React.FC<RequestListProps> = ({ items, collection, onFocus }) => {
  return items.map((item) => <RequestListItem onFocus={onFocus} key={item.uid} item={item} collection={collection} />);
};
