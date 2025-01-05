/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { CollectionSchema } from '@usebruno/schema';
import classes from './ResultDetails.module.scss';
import { useMemo, useState } from 'react';
import { findItemInCollection } from 'utils/collections';
import { ResponsePane } from 'src/feature/response-pane';

type ResultDetailsProps = {
  itemUid: string;
  collection: CollectionSchema;
};

export const ResultDetails: React.FC<ResultDetailsProps> = ({ itemUid, collection }) => {
  const [selectedTab, setSelectedTab] = useState('response');

  const item = useMemo(() => {
    return findItemInCollection(collection, itemUid);
  }, [itemUid]);

  return (
    <div className={classes.container}>
      <ResponsePane activeTab={selectedTab} collection={collection} item={item} setActiveTab={setSelectedTab} />
    </div>
  );
};
