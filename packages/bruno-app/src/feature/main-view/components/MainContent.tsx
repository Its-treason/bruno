import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import CollectionSettings from 'components/CollectionSettings';
import FolderSettings from 'components/FolderSettings';
import RunnerResults from 'components/RunnerResults';
import VariablesEditor from 'components/VariablesEditor';

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
      return <FolderSettings collection={collection} folder={item} />;
    default:
      return 'request';
  }
};
