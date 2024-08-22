import { Divider } from '@mantine/core';
import { CollectionSchema } from '@usebruno/schema';
import RequestTabs from 'components/RequestTabs';
import CollectionToolBar from 'components/RequestTabs/CollectionToolBar';
import { get } from 'lodash';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Homepage } from 'src/feature/homepage';
import { findItemInCollection } from 'utils/collections';
import { MainContent } from './MainContent';
import { CodeEditorVariableProvider } from 'components/CodeEditor/CodeEditorVariableProvider';
import classes from './MainContent.module.scss';

type ReduxStore = {
  tabs: {
    tabs: any[];
    activeTabUid: string;
  };
  collections: {
    collections: CollectionSchema[];
  };
  app: {
    preferences: {
      hideTabs?: boolean;
    };
  };
};

export const MainView: React.FC = () => {
  const tabs = useSelector((state: ReduxStore) => state.tabs.tabs) as any[];
  const activeTabUid = useSelector((state: ReduxStore) => state.tabs.activeTabUid);
  const collections = useSelector((state: ReduxStore) => state.collections.collections);
  const hideTabs = useSelector((state: ReduxStore) => get(state.app.preferences, 'hideTabs', false));

  const focusedTab = useMemo(() => {
    return tabs.find((tab) => tab.uid === activeTabUid);
  }, [tabs, activeTabUid]);

  const collection = useMemo(() => {
    return collections.find((col) => col.uid === focusedTab?.collectionUid);
  }, [collections, focusedTab?.collectionUid]);

  const item = useMemo(() => {
    if (!focusedTab) {
      return null;
    }
    return findItemInCollection(collection, focusedTab.uid);
  }, [collections, focusedTab?.uid]);

  if (!focusedTab || !collection) {
    return <Homepage />;
  }

  return (
    <div className={classes.main}>
      <CollectionToolBar activeTabUid={activeTabUid} collection={collection} />

      {!hideTabs ? <RequestTabs /> : null}

      <Divider />

      <div className={classes.content}>
        <CodeEditorVariableProvider>
          <MainContent collection={collection} focusedTab={focusedTab} item={item} />
        </CodeEditorVariableProvider>
      </div>
    </div>
  );
};
