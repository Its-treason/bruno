import React from 'react';
import { RunnerResultItem } from '../../types/runner';
import { CollectionSchema } from '@usebruno/schema';
import { RequestListItem } from './RequestListeItem';

type RequestListProps = {
  items: RunnerResultItem[];
  collection: CollectionSchema;
};

export const RequestList: React.FC<RequestListProps> = ({ items, collection }) => {
  return items.map((item) => <RequestListItem key={item.uid} item={item} collection={collection} />);
};
