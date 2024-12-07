import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import CollectionSettings from 'components/CollectionSettings';
import FolderSettings from 'components/FolderSettings';
import RunnerResults from 'components/RunnerResults';
import VariablesEditor from 'components/VariablesEditor';
import { RequestPaneSplit } from './RequestPaneSplit';
import { RequestUrlBar } from 'src/feature/request-url-bar';
import { HttpRequestPane } from './panes/http/HttpRequestPane';
import { GraphqlRequestPane } from './panes/graphql/GraphqlRequestPane';
import { ResponsePane } from './panes/response/ResponsePane';
import { Text } from '@mantine/core';

type MainContentProps = {
  collection: CollectionSchema;
  focusedTab: any;
  item?: RequestItemSchema;
};

export const MainContent: React.FC<MainContentProps> = ({ collection, focusedTab, item }) => {
  switch (focusedTab.type) {
    case 'collection-runner':
      return <RunnerResults collection={collection} />;
    case 'variables':
      return <VariablesEditor collection={collection} />;
    case 'collection-settings':
      return <CollectionSettings collection={collection} />;
    case 'folder-settings':
      if (!item) {
        return <Text p="md">Folder not found! It was probably manually deleted. You can close this tab.</Text>;
      }
      return <FolderSettings collection={collection} folder={item} />;
    default:
      if (!item) {
        return <Text p="md">Request not found! It was probably manually deleted. You can close this tab.</Text>;
      }
      return (
        <>
          <RequestUrlBar item={item} collection={collection} />
          <RequestPaneSplit
            left={
              item.type === 'http-request' ? (
                <HttpRequestPane item={item} collection={collection} activeTab={focusedTab} />
              ) : (
                <GraphqlRequestPane item={item} collection={collection} activeTab={focusedTab} />
              )
            }
            right={<ResponsePane item={item} collection={collection} activeTab={focusedTab} />}
          />
        </>
      );
  }
};
