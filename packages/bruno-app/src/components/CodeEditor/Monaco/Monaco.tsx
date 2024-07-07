/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Editor, Monaco, useMonaco } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { BrunoEditorCallbacks, addMonacoCommands, setMonacoVariables } from 'utils/monaco/monacoUtils';
import { getAllVariables } from 'utils/collections';
import { useTheme } from 'providers/Theme';
import { editor } from 'monaco-editor';
import { CollectionSchema } from '@usebruno/schema';

const languages: Record<string, string> = {
  text: 'plaintext',
  plaintext: 'plaintext',
  graphql: 'graphql',
  sparql: 'sparql',
  'graphql-query': 'graphql',
  'application/sparql-query': 'sparql',
  'application/ld+json': 'json',
  'application/text': 'plaintext',
  'application/xml': 'xml',
  'application/javascript': 'typescript',
  javascript: 'typescript',

  c: 'c',
  clojure: 'clojure',
  csharp: 'csharp',
  go: 'go',
  java: 'java',
  kotlin: 'kotlin',
  node: 'typescript',
  objc: 'objective-c',
  ocaml: 'ocaml',
  php: 'php',
  powershell: 'powershell',
  python: 'python',
  r: 'r',
  ruby: 'ruby',
  shell: 'shell',
  swift: 'swift'
};

type MonacoProps = {
  collection?: CollectionSchema;
  readOnly?: boolean;
  value?: string;
  withVariables?: boolean;
  mode?: string;
  height?: string | number;
  hideMinimap?: boolean;

  onChange?: (newValue: string) => void;
  onRun?: () => void;
  onSave?: () => void;
};

export const MonacoEditor: React.FC<MonacoProps> = ({
  collection,
  mode = 'plaintext',
  onChange,
  onRun,
  onSave,
  readOnly,
  value,
  withVariables = false,
  hideMinimap = false,
  height = '60vh'
}) => {
  const monaco = useMonaco();
  const { displayedTheme } = useTheme();
  const callbackRefs = useRef<BrunoEditorCallbacks>({});

  useEffect(() => {
    // Save the reference to the callback so the callbacks always update
    // OnMount is only executed once
    callbackRefs.current.onRun = onRun;
    callbackRefs.current.onSave = onSave;
    callbackRefs.current.onChange = onChange;
  }, [onRun, onSave, onChange]);

  const debounceChanges = debounce((newValue) => {
    onChange(newValue);
  }, 300);
  const handleEditorChange = (value: string | undefined) => {
    debounceChanges(value);
  };

  const onMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editor.onDidFocusEditorText(() => {
      // @ts-expect-error editor._contextKeyService is an internal state from the Monaco editor
      // But i did not find a better way to do this, because "tabFocusMode" in options does work
      // TabFocusMode itself is a global options, so it effects ALL monaco editor instances
      // And its only possible to toggle the TabFocusMode, with the "normal" API
      if (editor._contextKeyService.getContextKeyValue('editorTabMovesFocus') === true) {
        editor.trigger('ActiveTabFocusMode', 'editor.action.toggleTabFocusMode', true);
      }
    });

    addMonacoCommands(monaco, editor, callbackRefs.current);
  };

  useEffect(() => {
    if (withVariables && monaco && collection) {
      const allVariables = getAllVariables(collection);
      setMonacoVariables(monaco, allVariables, languages[mode] ?? 'plaintext');
    }
  }, [collection?.collectionVariables, collection?.activeEnvironmentUid, withVariables, mode]);

  return (
    <Editor
      options={{
        readOnly: readOnly,
        wordWrap: 'off',
        wrappingIndent: 'indent',
        autoIndent: 'keep',
        formatOnType: true,
        formatOnPaste: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        minimap: {
          enabled: !hideMinimap
        },
        scrollbar: {
          vertical: 'hidden',
          horizontal: 'hidden'
        },
        renderLineHighlight: 'none'
      }}
      height={height}
      theme={displayedTheme === 'dark' ? 'bruno-dark' : 'bruno-light'}
      language={languages[mode] ?? 'plaintext'}
      value={value}
      onMount={onMount}
      onChange={!readOnly ? handleEditorChange : null}
    />
  );
};
