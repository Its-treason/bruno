/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { CollectionSchema } from '@usebruno/schema';
import { RunnerResultItem } from '../../types/runner';
import { PaneWrapper } from 'src/feature/main-view/components/panes/PaneWrapper';
import { ResponseSummary } from 'src/feature/main-view/components/panes/response/ResponseSummary';
import classes from './ResultDetails.module.scss';
import { useMemo, useState } from 'react';
import { ResponsePaneBody } from 'src/feature/response-pane-body';
import ResponseHeaders from 'components/ResponsePane/ResponseHeaders';
import { TimelineNew } from 'components/ResponsePane/TimelineNew';
import TestResults from 'components/ResponsePane/TestResults';
import { DebugTab } from 'components/ResponsePane/Debug';
import { useStore } from 'zustand';
import { responseStore } from 'src/store/responseStore';

type ResultDetailsProps = {
  item: RunnerResultItem;
  collection: CollectionSchema;
};

export const ResultDetails: React.FC<ResultDetailsProps> = ({ item, collection }) => {
  const [selectedTab, setSelectedTab] = useState('response');

  const content = useMemo(() => {
    switch (selectedTab) {
      case 'response': {
        return (
          <ResponsePaneBody
            // @ts-expect-error
            item={item}
            collectionUid={collection.uid}
            disableRun={true} // Running request from Runner view does not make sense
          />
        );
      }
      case 'headers': {
        return <ResponseHeaders itemUid={item.uid} />;
      }
      case 'timeline': {
        return <TimelineNew itemUid={item.uid} />;
      }
      case 'tests': {
        return <TestResults itemUid={item.uid} />;
      }
      case 'debug': {
        return <DebugTab itemUid={item.uid} />;
      }
      default: {
        return <div>404 | Not found</div>;
      }
    }
  }, [selectedTab, item.uid]);

  const headers = useStore(responseStore, (state) => state.responses.get(item.uid)?.headers);
  const tabs = useMemo(() => {
    const headerCount = headers ? Object.keys(headers).length : null;
    return [
      { value: 'response', label: 'Response' },
      { value: 'headers', label: <>Headers {headerCount ? <sup>{headerCount}</sup> : null}</> },
      { value: 'timeline', label: 'Timeline' },
      { value: 'tests', label: 'Tests' },
      { value: 'debug', label: 'Debug' }
    ];
  }, [headers]);

  return (
    <div className={classes.container}>
      <PaneWrapper
        tabs={tabs}
        activeTab={selectedTab}
        // @ts-expect-error
        aboveTabs={<ResponseSummary item={item} />}
        onTabChange={(tab) => {
          setSelectedTab(tab);
        }}
        content={content}
      />
    </div>
  );
};
