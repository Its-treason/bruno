import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import CollectionSettings from 'components/CollectionSettings';
import FolderSettings from 'components/FolderSettings';
import RunnerResults from 'components/RunnerResults';
import VariablesEditor from 'components/VariablesEditor';
import { RequestPaneSplit } from './RequestPaneSplit';
import HttpRequestPane from 'components/RequestPane/HttpRequestPane';
import ResponsePane from 'components/ResponsePane';
import { RequestUrlBar } from 'src/feature/request-url-bar';
import { useDispatch } from 'react-redux';
import { sendRequest } from 'providers/ReduxStore/slices/collections/actions';
import NetworkError from 'components/ResponsePane/NetworkError';
import toast from 'react-hot-toast';
import GraphQLRequestPane from 'components/RequestPane/GraphQLRequestPane';

type MainContentProps = {
  collection: CollectionSchema;
  focusedTab: any;
  item?: RequestItemSchema;
};

export const MainContent: React.FC<MainContentProps> = ({ collection, focusedTab, item }) => {
  const dispatch = useDispatch();

  switch (focusedTab.type) {
    case 'collection-runner':
      return <RunnerResults collection={collection} />;
    case 'variables':
      return <VariablesEditor collection={collection} />;
    case 'collection-settings':
      return <CollectionSettings collection={collection} />;
    case 'folder-settings':
      return <FolderSettings collection={collection} folder={item} />;
    default:
      return (
        <>
          <RequestUrlBar item={item} collection={collection} />
          <RequestPaneSplit
            left={
              item.type === 'http-request' ? (
                <HttpRequestPane item={item} collection={collection} />
              ) : (
                <GraphQLRequestPane item={item} collection={collection} />
              )
            }
            right={<ResponsePane item={item} collection={collection} />}
          />
        </>
      );
  }
};
