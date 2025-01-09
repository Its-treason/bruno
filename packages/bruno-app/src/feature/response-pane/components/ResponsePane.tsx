/*
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { useEffect, useMemo } from 'react';
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
import { AboveTabsWrapper } from './responseHistory/AboveTabsWrapper';
import { ResponseHistory } from './responseHistory/ResponseHistory';
import { ResponseLoading } from './loadingOverlay/ResponseLoading';

type ResponsePane = {
  item: RequestItemSchema;
  collection: CollectionSchema;
  activeTab: string;
  selectedRequestIdUid: string;
  showHistory?: boolean;
  setActiveTab: (newTab: string) => void;
};

export const ResponsePane: React.FC<ResponsePane> = ({
  item,
  collection,
  activeTab,
  selectedRequestIdUid,
  setActiveTab,
  showHistory = false
}) => {
  const [hasResponse, isLoading] = useStore(
    responseStore,
    useShallow((state) => {
      const response = state.responses.get(selectedRequestIdUid);
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

    if (isLoading) {
      return <ResponseLoading requestId={selectedRequestIdUid} />;
    }

    switch (activeTab) {
      case 'response':
        return (
          <ResponseBody
            requestId={selectedRequestIdUid}
            item={item}
            collectionUid={collection.uid}
            disableRun={isLoading}
          />
        );
      case 'headers':
        return <ResponseHeaders requestId={selectedRequestIdUid} />;
      case 'timeline':
        return <Timeline requestId={selectedRequestIdUid} />;
      case 'tests':
        return <Tests requestId={selectedRequestIdUid} />;
      case 'debug':
        return <Debug requestId={selectedRequestIdUid} />;
    }
  }, [activeTab, item, selectedRequestIdUid, isLoading, hasResponse]);

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
        <Placeholder itemUid={item.uid} selectedResponseUid={selectedRequestIdUid} />
        {isLoading ? <ResponseLoadingOverlay requestId={selectedRequestIdUid} /> : null}
      </>
    );
  }

  return (
    <PaneWrapper
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      aboveTabs={
        showHistory ? (
          <AboveTabsWrapper
            history={<ResponseHistory itemUid={item.uid} selectedResponseUid={selectedRequestIdUid} />}
            summary={<ResponseSummary requestId={selectedRequestIdUid} itemUid={item.uid} />}
          />
        ) : (
          <ResponseSummary requestId={selectedRequestIdUid} itemUid={item.uid} />
        )
      }
      content={content}
    />
  );
};
