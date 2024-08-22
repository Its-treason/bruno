import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { PaneWrapper } from './PaneWrapper';
import { Tabs } from '@mantine/core';
import { useMemo } from 'react';
import QueryParams from 'components/RequestPane/QueryParams';
import Documentation from 'components/Documentation';
import Tests from 'components/RequestPane/Tests';
import Script from 'components/RequestPane/Script';
import Assertions from 'components/RequestPane/Assertions';
import Vars from 'components/RequestPane/Vars';
import Auth from 'components/RequestPane/Auth';
import { RequestHeaders } from 'components/RequestPane/RequestHeaders';
import RequestBody from 'components/RequestPane/RequestBody';
import { get } from 'lodash';
import { updateRequestPaneTab } from 'providers/ReduxStore/slices/tabs';
import { useDispatch } from 'react-redux';

type HttpRequestPaneProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
  activeTab: any;
};

export const HttpRequestPane: React.FC<HttpRequestPaneProps> = ({ item, collection, activeTab }) => {
  const dispatch = useDispatch();

  const content = useMemo(() => {
    switch (activeTab.requestPaneTab) {
      case 'params':
        return <QueryParams item={item} collection={collection} />;
      case 'body':
        return <RequestBody item={item} collection={collection} />;
      case 'headers':
        return <RequestHeaders item={item} collection={collection} />;
      case 'auth':
        return <Auth item={item} collection={collection} />;
      case 'vars':
        return <Vars item={item} collection={collection} />;
      case 'assert':
        return <Assertions item={item} collection={collection} />;
      case 'script':
        return <Script item={item} collection={collection} />;
      case 'tests':
        return <Tests item={item} collection={collection} />;
      case 'docs':
        return <Documentation item={item} collection={collection} />;
    }
  }, [activeTab.requestPaneTab, item]);

  const tabs = useMemo(() => {
    const request = item.draft ? item.draft.request : item.request;

    const paramCount = request.params.filter((param) => param.enabled).length;
    const headerCount = request.headers.filter((header) => header.enabled).length;
    const varCount =
      request.vars.req?.filter((reqVar) => reqVar.enabled).length +
      request.vars.res?.filter((resVar) => resVar.enabled).length;
    const assertCount = request.assertions.filter((assert) => assert.enabled).length;

    return [
      { value: 'params', label: <>Params {paramCount ? <sup>{paramCount}</sup> : null}</> },
      { value: 'body', label: 'Body' },
      { value: 'headers', label: <>Headers {headerCount ? <sup>{headerCount}</sup> : null}</> },
      { value: 'auth', label: 'Auth' },
      { value: 'vars', label: <>Vars {varCount ? <sup>{varCount}</sup> : null}</> },
      { value: 'assert', label: <>Assert {assertCount ? <sup>{assertCount}</sup> : null}</> },
      { value: 'script', label: 'Script' },
      { value: 'tests', label: 'Tests' },
      { value: 'docs', label: 'Docs' }
    ];
  }, [item]);

  return (
    <PaneWrapper
      tabs={tabs}
      activeTab={activeTab.requestPaneTab}
      onTabChange={(tab) => {
        dispatch(
          updateRequestPaneTab({
            uid: item.uid,
            requestPaneTab: tab
          })
        );
      }}
      content={content}
    />
  );
};
