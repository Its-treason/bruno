/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { CollectionSchema } from '@usebruno/schema';
import classes from './ResultDetails.module.scss';
import { useMemo, useState } from 'react';
import { findItemInCollection } from 'utils/collections';
import { ResponsePane } from 'src/feature/response-pane';
import { useStore } from 'zustand';
import { responseStore } from 'src/store/responseStore';

type ResultDetailsProps = {
  requestId: string;
  collection: CollectionSchema;
};

export const ResultDetails: React.FC<ResultDetailsProps> = ({ requestId, collection }) => {
  const [selectedTab, setSelectedTab] = useState('response');

  const itemId = useStore(responseStore, (state) => state.responses.get(requestId)?.itemId);
  const item = useMemo(() => {
    return findItemInCollection(collection, itemId);
  }, [itemId]);

  return (
    <div className={classes.container}>
      <ResponsePane
        selectedRequestIdUid={requestId}
        activeTab={selectedTab}
        collection={collection}
        item={item}
        setActiveTab={setSelectedTab}
      />
    </div>
  );
};
