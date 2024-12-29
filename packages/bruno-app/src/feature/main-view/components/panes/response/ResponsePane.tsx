import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { PaneWrapper } from '../PaneWrapper';
import { useMemo } from 'react';
import { updateResponsePaneTab } from 'providers/ReduxStore/slices/tabs';
import { useDispatch } from 'react-redux';
import Placeholder from 'components/ResponsePane/Placeholder';
import { ResponseLoadingOverlay as Overlay } from 'components/ResponsePane/Overlay';
import ResponseHeaders from 'components/ResponsePane/ResponseHeaders';
import { TimelineNew } from 'components/ResponsePane/TimelineNew';
import { DebugTab } from 'components/ResponsePane/Debug';
import TestResults from 'components/ResponsePane/TestResults';
import { ResponseSummary } from './ResponseSummary';
import { ResponsePaneBody } from 'src/feature/response-pane-body';
import { useStore } from 'zustand';
import { responseStore } from 'src/store/responseStore';
import { useShallow } from 'zustand/react/shallow';

type ResponsePane = {
  item: RequestItemSchema;
  collection: CollectionSchema;
  activeTab: any;
};

export const ResponsePane: React.FC<ResponsePane> = ({ item, collection, activeTab }) => {
  const dispatch = useDispatch();

  const [hasResponse, isLoading] = useStore(
    responseStore,
    useShallow((state) => {
      const response = state.responses.get(item.uid);
      if (response === undefined) {
        return [false, false];
      }
      return [true, response.requestState === 'queued' || response.requestState === 'sending'];
    })
  );

  const content = useMemo(() => {
    if (!hasResponse) {
      return;
    }

    switch (activeTab.responsePaneTab) {
      case 'response':
        if (isLoading) {
          return;
        }
        return <ResponsePaneBody item={item} collectionUid={collection.uid} disableRun={isLoading} />;
      case 'headers':
        return <ResponseHeaders itemUid={item.uid} />;
      case 'timeline':
        return <TimelineNew itemUid={item.uid} />;
      case 'tests':
        return <TestResults itemUid={item.uid} />;
      case 'debug':
        return <DebugTab itemUid={item.uid} />;
    }
  }, [activeTab.responsePaneTab, item, isLoading, hasResponse]);

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

  if (!content) {
    return (
      <>
        <Placeholder />
        {isLoading ? <Overlay item={item} /> : null}
      </>
    );
  }

  return (
    <>
      {isLoading ? <Overlay item={item} /> : null}
      <PaneWrapper
        tabs={tabs}
        activeTab={activeTab.responsePaneTab}
        aboveTabs={<ResponseSummary item={item} />}
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
