/*
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { useMemo } from 'react';
import { responseStore } from 'src/store/responseStore';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { ResponseBody } from './body/ResponseBody';
import { PaneWrapper } from 'src/feature/main-view';
import { Placeholder } from './Placeholder';
import { ResponseLoadingOverlay } from './loadingOverlay/ResponseLoadingOverlay';
import { ResponseSummary } from './summary/ResponseSummary';
import { Debug } from './debug/Debug';
import { Timeline } from './timeline/Timeline';
import { ResponseHeaders } from './headers/ResponseHeaders';
import { Tests } from './tests/Tests';

type ResponsePane = {
  item: RequestItemSchema;
  collection: CollectionSchema;
  activeTab: string;
  setActiveTab: (newTab: string) => void;
};

export const ResponsePane: React.FC<ResponsePane> = ({ item, collection, activeTab, setActiveTab }) => {
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

    switch (activeTab) {
      case 'response':
        if (isLoading) {
          return;
        }
        return <ResponseBody item={item} collectionUid={collection.uid} disableRun={isLoading} />;
      case 'headers':
        return <ResponseHeaders itemUid={item.uid} />;
      case 'timeline':
        return <Timeline itemUid={item.uid} />;
      case 'tests':
        return <Tests itemUid={item.uid} />;
      case 'debug':
        return <Debug itemUid={item.uid} />;
    }
  }, [activeTab, item, isLoading, hasResponse]);

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
        {isLoading ? <ResponseLoadingOverlay item={item} /> : null}
      </>
    );
  }

  return (
    <>
      {isLoading ? <ResponseLoadingOverlay item={item} /> : null}
      <PaneWrapper
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        aboveTabs={<ResponseSummary itemUid={item.uid} />}
        content={content}
      />
    </>
  );
};
