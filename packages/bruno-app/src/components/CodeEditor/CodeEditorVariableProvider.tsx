import { ReactNode, useEffect, useState } from 'react';
import { CodeEditorVariableContext } from './CodeEditorVariableContext';
import { useSelector } from 'react-redux';
import { find } from 'lodash';
import { findCollectionByUid, findItemInCollection, getAllVariables } from 'utils/collections';
import { shallowEqual } from 'utils/common';

type CodeEditorVariableProviderProps = {
  children: ReactNode;
  // Used for the Environment editor
  ignoreRequestVariables?: boolean;
};

export const CodeEditorVariableProvider: React.FC<CodeEditorVariableProviderProps> = ({
  children,
  ignoreRequestVariables = false
}) => {
  const [variables, setVariables] = useState({ variables: {}, pathParams: {} });
  const tabs = useSelector<any>((state) => state.tabs.tabs) as any[];
  const collections = useSelector<any>((state) => state.collections.collections);
  const activeTabUid = useSelector<any>((state) => state.tabs.activeTabUid);

  useEffect(() => {
    const activeTab = find(tabs, (t) => t.uid === activeTabUid);
    if (!activeTab) {
      return;
    }
    const collection = findCollectionByUid(collections, activeTab.collectionUid);
    if (!collection) {
      return;
    }
    const item = !ignoreRequestVariables ? findItemInCollection(collection, activeTabUid) : null;

    const newVariables = getAllVariables(collection, item);

    if (shallowEqual(newVariables, variables) === false) {
      console.log(newVariables.variables);
      setVariables(newVariables);
    }
  }, [activeTabUid, collections]);

  return <CodeEditorVariableContext.Provider value={variables}>{children}</CodeEditorVariableContext.Provider>;
};
