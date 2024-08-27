import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { PaneWrapper } from '../PaneWrapper';
import { useMemo } from 'react';
import { updateResponsePaneTab } from 'providers/ReduxStore/slices/tabs';
import { useDispatch } from 'react-redux';
import Placeholder from 'components/ResponsePane/Placeholder';
import { ResponseLoadingOverlay as Overlay } from 'components/ResponsePane/Overlay';
import QueryResult from 'components/ResponsePane/QueryResult';
import ResponseHeaders from 'components/ResponsePane/ResponseHeaders';
import { TimelineNew } from 'components/ResponsePane/TimelineNew';
import Timeline from 'components/ResponsePane/Timeline';
import { DebugTab } from 'components/ResponsePane/Debug';
import TestResults from 'components/ResponsePane/TestResults';
import { ResponseSummary } from './ResponseSummary';

type ResponsePane = {
  item: RequestItemSchema;
  collection: CollectionSchema;
  activeTab: any;
};

export const ResponsePane: React.FC<ResponsePane> = ({ item, collection, activeTab }) => {
  const dispatch = useDispatch();
  const isLoading = ['queued', 'sending'].includes(item.requestState);
  // @ts-expect-error
  const res = item.response;

  const content = useMemo(() => {
    if (!res) {
      return;
    }

    switch (activeTab.responsePaneTab) {
      case 'response':
        return (
          <QueryResult
            item={item}
            collection={collection}
            headers={res.headers}
            error={res.error}
            disableRunEventListener={isLoading}
          />
        );
      case 'headers':
        return <ResponseHeaders headers={res.headers} />;
      case 'timeline':
        return res.isNew ? (
          <TimelineNew timeline={res.timeline} />
        ) : (
          // @ts-expect-error
          <Timeline request={item.requestSent} response={res} />
        );
      case 'tests':
        // @ts-expect-error
        return <TestResults results={item.testResults} assertionResults={item.assertionResults} />;
      case 'debug':
        return res.isNew ? <DebugTab debugInfo={res.debug} timings={res.timings} /> : 'Only with new Request method';
    }
  }, [activeTab.responsePaneTab, item]);

  const tabs = useMemo(() => {
    // @ts-expect-error
    const res = item.response as any | null;

    const headerCount = res?.headers ? Object.entries(res.headers).length : null;

    return [
      { value: 'response', label: 'Response' },
      { value: 'headers', label: <>Headers {headerCount ? <sup>{headerCount}</sup> : null}</> },
      { value: 'timeline', label: 'Timeline' },
      { value: 'tests', label: 'Tests' },
      { value: 'debug', label: 'Debug' }
    ];
  }, [item]);

  // @ts-expect-error
  if (!item.response) {
    return (
      <>
        <Placeholder />
        {isLoading ? <Overlay item={item} collection={collection} /> : null}
      </>
    );
  }

  return (
    <>
      {isLoading ? <Overlay item={item} collection={collection} /> : null}
      <PaneWrapper
        tabs={tabs}
        activeTab={activeTab.responsePaneTab}
        aboveTabs={<ResponseSummary collection={collection} item={item} response={res} />}
        onTabChange={(tab) => {
          dispatch(
            updateResponsePaneTab({
              uid: item.uid,
              responsePaneTab: tab
            })
          );
        }}
        content={content}
      />
    </>
  );
};
