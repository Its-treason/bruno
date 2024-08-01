import { ReactNode, useMemo } from 'react';
import { CodeEditorVariableContext } from './CodeEditorVariableContext';
import { useSelector } from 'react-redux';
import { find } from 'lodash';
import { findCollectionByUid, findItemInCollection, getAllVariables } from 'utils/collections';

type CodeEditorVariableProviderProps = {
  children: ReactNode;
  // Used for the Environment editor
  ignoreRequestVariables?: boolean;
};

export const CodeEditorVariableProvider: React.FC<CodeEditorVariableProviderProps> = ({
  children,
  ignoreRequestVariables = false
}) => {
  const tabs = useSelector<any>((state) => state.tabs.tabs) as any[];
  const collections = useSelector<any>((state) => state.collections.collections);
  const activeTabUid = useSelector<any>((state) => state.tabs.activeTabUid);

  const variables = useMemo(() => {
    const activeTab = find(tabs, (t) => t.uid === activeTabUid);
    if (!activeTab) {
      return;
    }
    const collection = findCollectionByUid(collections, activeTab.collectionUid);
    if (!collection) {
      return;
    }
    const item = !ignoreRequestVariables ? findItemInCollection(collection, activeTabUid) : null;

    return getAllVariables(collection, item);
  }, [activeTabUid, collections]);

  return <CodeEditorVariableContext.Provider value={variables}>{children}</CodeEditorVariableContext.Provider>;
};
