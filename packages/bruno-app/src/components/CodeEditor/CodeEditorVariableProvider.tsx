import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { CodeEditorVariableContext } from './CodeEditorVariableContext';
import { useSelector } from 'react-redux';
import { find } from 'lodash';
import { findCollectionByUid, findItemInCollection, getAllVariables } from 'utils/collections';
import { useMonaco } from '@monaco-editor/react';
import { editor, Range } from 'monaco-editor';
import { shallowEqual } from '@mantine/hooks';

function highlightSpecificWords(editor: editor.IStandaloneCodeEditor, wordsToHighlight: Record<string, string>) {
  const model = editor.getModel();
  const text = model.getValue();
  const decorations: { range: Range; options: editor.IModelDecorationOptions }[] = [];

  const regex = /{{[\w-\.]+}}/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const startPosition = model.getPositionAt(match.index);
    const endPosition = model.getPositionAt(match.index + match[0].length);

    let inlineClassName = 'brunoPlaceholderHighlightInvalid';
    let hoverMessage = { value: '**Variable not found**', trusted: true };

    const value = wordsToHighlight[match[0].slice(2, -2)];
    if (value) {
      inlineClassName = 'brunoPlaceholderHighlightValid';
      hoverMessage = { value, trusted: false };
    }

    decorations.push({
      range: new Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column),
      options: {
        inlineClassName,
        hoverMessage
      }
    });
  }

  return editor.createDecorationsCollection(decorations);
}

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

    function flattenVariables(obj: any, prefix: string = '') {
      return Object.keys(obj).reduce((acc, key) => {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          return [...acc, ...flattenVariables(obj[key], newKey)];
        } else {
          return [...acc, [newKey, obj[key]]];
        }
      }, []);
    }

    const newVariables = getAllVariables(collection, item);
    const flattened = Object.fromEntries(flattenVariables(newVariables.variables));

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
  }, [activeTabUid, collections, monaco]);

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
