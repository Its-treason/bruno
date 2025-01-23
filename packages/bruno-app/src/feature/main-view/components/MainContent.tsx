import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import CollectionSettings from 'components/CollectionSettings';
import FolderSettings from 'components/FolderSettings';
import { RequestPaneSplit } from './RequestPaneSplit';
import { RequestUrlBar } from 'src/feature/request-url-bar';
import { HttpRequestPane } from './panes/http/HttpRequestPane';
import { GraphqlRequestPane } from './panes/graphql/GraphqlRequestPane';
import { Text } from '@mantine/core';
import { Runner } from 'src/feature/runner';
import { ResponsePane } from 'src/feature/response-pane';
import { useDispatch } from 'react-redux';
import { updateResponsePaneTab } from 'providers/ReduxStore/slices/tabs';
import { VariablesViewer } from 'src/feature/variables-viewer';

type MainContentProps = {
  collection: CollectionSchema;
  focusedTab: any;
  item?: RequestItemSchema;
};

export const MainContent: React.FC<MainContentProps> = ({ collection, focusedTab, item }) => {
  const dispatch = useDispatch();

  switch (focusedTab.type) {
    case 'collection-runner':
      return <Runner collection={collection} />;
    case 'variables':
      return <VariablesViewer collection={collection} />;
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
            right={
              <ResponsePane
                item={item}
                collection={collection}
                activeTab={focusedTab.responsePaneTab}
                selectedRequestIdUid={focusedTab.requestId}
                setActiveTab={(responsePaneTab) => {
                  dispatch(
                    updateResponsePaneTab({
                      uid: item.uid,
                      responsePaneTab
                    })
                  );
                }}
                showHistory
              />
            }
          />
        </>
      );
  }
};
