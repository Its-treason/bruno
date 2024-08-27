import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { PaneWrapper } from '../PaneWrapper';
import { useMemo, useState } from 'react';
import QueryParams from 'components/RequestPane/QueryParams';
import Documentation from 'components/Documentation';
import Tests from 'components/RequestPane/Tests';
import Script from 'components/RequestPane/Script';
import Assertions from 'components/RequestPane/Assertions';
import Vars from 'components/RequestPane/Vars';
import Auth from 'components/RequestPane/Auth';
import { RequestHeaders } from 'components/RequestPane/RequestHeaders';
import { updateRequestPaneTab } from 'providers/ReduxStore/slices/tabs';
import { useDispatch } from 'react-redux';
import { DocExplorerWrapper } from 'src/feature/main-view/components/panes/graphql/DocExplorerWrapper';
import GraphQLSchemaActions from 'components/RequestPane/GraphQLSchemaActions';
import GraphQLVariables from 'components/RequestPane/GraphQLVariables';
import { get } from 'lodash';
import { updateRequestGraphqlQuery } from 'providers/ReduxStore/slices/collections';
import CodeEditor from 'components/CodeEditor';
import { saveRequest, sendRequest } from 'providers/ReduxStore/slices/collections/actions';

const CONTENT_INDICATOR = '\u25CF';

type GraphqlRequestPaneProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
  activeTab: any;
};

export const GraphqlRequestPane: React.FC<GraphqlRequestPaneProps> = ({ item, collection, activeTab }) => {
  const dispatch = useDispatch();

  const [schema, setSchema] = useState(null);
  const [docExplorerOpened, setDocExplorerOpened] = useState(false);

  const content = useMemo(() => {
    switch (activeTab.requestPaneTab) {
      case 'query':
        const onQueryChange = (value) => {
          dispatch(
            updateRequestGraphqlQuery({
              query: value,
              itemUid: item.uid,
              collectionUid: collection.uid
            })
          );
        };
        const onRun = () => dispatch(sendRequest(item, collection.uid));
        const onSave = () => dispatch(saveRequest(item.uid, collection.uid));

        const query = item.draft
          ? get(item, 'draft.request.body.graphql.query', '')
          : get(item, 'request.body.graphql.query', '');

        return (
          <CodeEditor
            // schema={schema}
            onSave={onSave}
            value={query}
            onRun={onRun}
            mode={'graphql-query'}
            onChange={onQueryChange}
            height={'100%'}
            withVariables
          />
        );
      case 'variables':
        const variables = item.draft
          ? get(item, 'draft.request.body.graphql.variables')
          : get(item, 'request.body.graphql.variables');

        return <GraphQLVariables variables={variables} item={item} collection={collection} />;
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
      aboveTabs={
        <>
          <GraphQLSchemaActions
            item={item}
            collection={collection}
            onSchemaLoad={setSchema}
            toggleDocs={() => setDocExplorerOpened(!docExplorerOpened)}
          />
          <DocExplorerWrapper onClose={() => setDocExplorerOpened(false)} opened={docExplorerOpened} schema={schema} />
        </>
      }
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
