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

type ResultDetailsProps = {
  item: RunnerResultItem;
  collection: CollectionSchema;
};

export const ResultDetails: React.FC<ResultDetailsProps> = ({ item, collection }) => {
  const [selectedTab, setSelectedTab] = useState('response');

  const { responseReceived, testResults, assertionResults, error, timings, debug, timeline } = item;

  const content = useMemo(() => {
    switch (selectedTab) {
      case 'response': {
        return (
          <ResponsePaneBody
            // @ts-expect-error
            item={item}
            collection={collection}
            disableRun={true} // Running request from Runner view does not make sense
            error={error}
            size={responseReceived.size}
          />
        );
      }
      case 'headers': {
        const headers = responseReceived.headers ?? [];
        return <ResponseHeaders headers={headers} />;
      }
      case 'timeline': {
        return <TimelineNew timeline={timeline} />;
      }
      case 'tests': {
        return <TestResults results={testResults} assertionResults={assertionResults} />;
      }
      case 'debug': {
        return <DebugTab debugInfo={debug} timings={timings || {}} />;
      }
      default: {
        return <div>404 | Not found</div>;
      }
    }
  }, [selectedTab, item.uid]);

  const tabs = useMemo(() => {
    const headerCount = responseReceived.headers ? Object.entries(responseReceived.headers).length : null;

    return [
      { value: 'response', label: 'Response' },
      { value: 'headers', label: <>Headers {headerCount ? <sup>{headerCount}</sup> : null}</> },
      { value: 'timeline', label: 'Timeline' },
      { value: 'tests', label: 'Tests' },
      { value: 'debug', label: 'Debug' }
    ];
  }, [item]);

  return (
    <div className={classes.container}>
      <PaneWrapper
        tabs={tabs}
        activeTab={selectedTab}
        // @ts-expect-error
        aboveTabs={<ResponseSummary collection={collection} item={item} response={responseReceived} />}
        onTabChange={(tab) => {
          setSelectedTab(tab);
        }}
        content={content}
      />
    </div>
  );
};
