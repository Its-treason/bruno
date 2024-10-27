import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { CodeEditorVariableContext } from './CodeEditorVariableContext';
import { useSelector } from 'react-redux';
import { find } from 'lodash';
import { findCollectionByUid, findItemInCollection, getAllVariables } from 'utils/collections';
import { useMonaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { shallowEqual } from '@mantine/hooks';
import { flattenVariables, highlightSpecificWords } from './utils/placeholderDecorator';
import { globalEnvironmentStore } from 'src/store/globalEnvironmentStore';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow'

type CodeEditorVariableProviderProps = {
  children: ReactNode;
  // Used for the Environment editor
  ignoreRequestVariables?: boolean;
};

export const CodeEditorVariableProvider: React.FC<CodeEditorVariableProviderProps> = ({
  children,
  ignoreRequestVariables = false
}) => {
  const monaco = useMonaco();
  const tabs = useSelector<any>((state) => state.tabs.tabs) as any[];
  const collections = useSelector<any>((state) => state.collections.collections);
  const activeTabUid = useSelector<any>((state) => state.tabs.activeTabUid);
  const globalVariableList = useStore(globalEnvironmentStore, useShallow((state) => state.environments.get(state.activeEnvironment)?.variables ?? []));

  const currentVariables = useRef({});

  const editorRefs = useRef<Map<string, editor.IStandaloneCodeEditor>>(new Map());
  const decorationsRefs = useRef<Map<string, editor.IEditorDecorationsCollection>>(new Map());

  useEffect(() => {
    const activeTab = find(tabs, (t) => t.uid === activeTabUid);
    if (!activeTab || !monaco) {
      return;
    }
    const collection = findCollectionByUid(collections, activeTab.collectionUid);
    if (!collection) {
      return;
    }
    const item = !ignoreRequestVariables ? findItemInCollection(collection, activeTabUid) : null;

    const globalVariables = globalVariableList.reduce((acc, variable) => {
      if (variable.enabled) {
        acc[variable.name] = variable.value;
      }
      return acc;
    }, {});

    const newVariables = getAllVariables(collection, item);
    const flattened = Object.fromEntries(
      flattenVariables({
        ...globalVariables,
        ...newVariables.variables,
      }),
    );

    // Don't update if both are still equal
    if (shallowEqual(flattened, currentVariables.current) === true) {
      return;
    }
    currentVariables.current = flattened;

    // Remove any deleted / unmounted editors
    for (const [editorId, editor] of editorRefs.current) {
      if (editor.getModel()?.isDisposed() !== false) {
        editorRefs.current.delete(editorId);
        decorationsRefs.current.delete(editorId);
      }
    }

    for (const [editorId, editor] of editorRefs.current) {
      decorationsRefs.current.get(editorId)?.clear();
      decorationsRefs.current.set(editorId, highlightSpecificWords(editor, currentVariables.current));
    }
  }, [activeTabUid, collections, globalVariableList, monaco]);

  const registerEditor = useCallback((editor: editor.IStandaloneCodeEditor) => {
    const editorId = editor.getId();

    editorRefs.current.set(editorId, editor);

    // Make the first highlight
    decorationsRefs.current.set(editorId, highlightSpecificWords(editor, currentVariables.current));

    // Listen for changes to update the highlighting
    editor.onDidChangeModelContent(() => {
      decorationsRefs.current.get(editorId)?.clear();
      decorationsRefs.current.set(editorId, highlightSpecificWords(editor, currentVariables.current));
    });
  }, []);

  return <CodeEditorVariableContext.Provider value={registerEditor}>{children}</CodeEditorVariableContext.Provider>;
};
