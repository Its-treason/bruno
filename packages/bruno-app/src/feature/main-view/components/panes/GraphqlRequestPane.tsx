import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { PaneWrapper } from './PaneWrapper';
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
import { updateRequestPaneTab } from 'providers/ReduxStore/slices/tabs';
import { useDispatch } from 'react-redux';

const CONTENT_INDICATOR = '\u25CF';

type GraphqlRequestPaneProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
  activeTab: any;
};

export const GraphqlRequestPane: React.FC<GraphqlRequestPaneProps> = ({ item, collection, activeTab }) => {
  const dispatch = useDispatch();

  const content = useMemo(() => {
    switch (activeTab.requestPaneTab) {
      case 'query':
        return <QueryParams item={item} collection={collection} />;
      case 'variables':
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

    const headerCount = request.headers.filter((header) => header.enabled).length;
    const varCount =
      request.vars.req?.filter((reqVar) => reqVar.enabled).length +
      request.vars.res?.filter((resVar) => resVar.enabled).length;
    const assertCount = request.assertions.filter((assert) => assert.enabled).length;

    const hasScript = request.script.req || request.script.res;
    const hasTests = !!request.tests;
    const hasDocs = !!request.docs;

    return [
      { value: 'query', label: 'Query' },
      { value: 'variables', label: 'Variables' },
      { value: 'headers', label: <>Headers {headerCount ? <sup>{headerCount}</sup> : null}</> },
      { value: 'auth', label: 'Auth' },
      { value: 'vars', label: <>Vars {varCount ? <sup>{varCount}</sup> : null}</> },
      { value: 'assert', label: <>Assert {assertCount ? <sup>{assertCount}</sup> : null}</> },
      { value: 'script', label: <>Script {hasScript ? <sup>{CONTENT_INDICATOR}</sup> : null}</> },
      { value: 'tests', label: <>Tests {hasTests ? <sup>{CONTENT_INDICATOR}</sup> : null}</> },
      { value: 'docs', label: <>Docs {hasDocs ? <sup>{CONTENT_INDICATOR}</sup> : null}</> }
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
