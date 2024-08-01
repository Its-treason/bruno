/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Editor, Monaco, useMonaco } from '@monaco-editor/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';
import {
  BrunoEditorCallbacks,
  addMonacoCommands,
  addMonacoSingleLineActions,
  setMonacoVariables
} from 'utils/monaco/monacoUtils';
import { useTheme } from 'providers/Theme';
import { editor } from 'monaco-editor';
import { Paper, Text } from '@mantine/core';
import classes from './MonacoSingleline.module.scss';
import { CollectionSchema } from '@usebruno/schema';
import { CodeEditorVariableContext } from '../CodeEditorVariableContext';

type MonacoSinglelineProps = {
  collection?: CollectionSchema;
  readOnly?: boolean;
  value?: string;
  defaultValue?: string;
  withVariables?: boolean;
  allowLinebreaks?: boolean;
  asInput?: boolean;
  label?: string;

  onChange?: (newValue: string) => void;
  onRun?: () => void;
  onSave?: () => void;
};

export const MonacoSingleline: React.FC<MonacoSinglelineProps> = ({
  collection,
  onChange,
  onRun,
  onSave,
  readOnly = false,
  value,
  defaultValue,
  withVariables = false,
  allowLinebreaks = false,
  asInput = false,
  label
}) => {
  const monaco = useMonaco();
  const { displayedTheme } = useTheme();
  const callbackRefs = useRef<BrunoEditorCallbacks>({});
  const [height, setHeight] = useState(22);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    // Save the reference to the callback so the callbacks always update
    // OnMount is only executed once
    callbackRefs.current.onRun = onRun;
    callbackRefs.current.onSave = onSave;
    callbackRefs.current.onChange = onChange;
  }, [onRun, onSave, onChange]);

  const debounceChanges = debounce((newValue) => {
    onChange(newValue);
  }, 500);
  const handleEditorChange = (value: string | undefined) => {
    debounceChanges(value);
  };

  const onMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editor.onDidFocusEditorText(() => {
      // @ts-expect-error editor._contextKeyService is an internal state from the Monaco editor
      // But i did not find a better way to do this, because "tabFocusMode" in options does work
      // TabFocusMode itself is a global options, so it effects ALL monaco editor instances
      // And its only possible to toggle the TabFocusMode, with the "normal" API
      if (editor._contextKeyService.getContextKeyValue('editorTabMovesFocus') === false) {
        editor.trigger('ActiveTabFocusMode', 'editor.action.toggleTabFocusMode', true);
      }
      setFocused(true);
    });
    editor.onDidBlurEditorText(() => {
      setFocused(false);
    });

    addMonacoCommands(monaco, editor, callbackRefs.current);
    addMonacoSingleLineActions(editor, monaco, allowLinebreaks, setHeight);
  };

  const { variables } = useContext(CodeEditorVariableContext);
  useEffect(() => {
    if (withVariables && monaco && variables) {
      setMonacoVariables(monaco, variables, 'plaintext');
    }
  }, [variables, withVariables, monaco]);

  return (
    <div>
      {label ? <Text size="sm">{label}</Text> : null}
      <Paper className={asInput ? classes.paper : classes.paperHidden} data-focused={focused}>
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
            scrollbar: {
              vertical: allowLinebreaks ? 'auto' : 'hidden',
              horizontal: 'hidden'
            },
            folding: false,
            renderLineHighlight: 'none',
            lineNumbers: 'off',
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            glyphMargin: false,
            links: false,
            overviewRulerLanes: 0,
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            scrollBeyondLastColumn: 0,
            showFoldingControls: 'never',
            selectionHighlight: false,
            occurrencesHighlight: 'off',
            find: { addExtraSpaceOnTop: false, autoFindInSelection: 'never', seedSearchStringFromSelection: 'never' },
            minimap: { enabled: false },
            fontSize: asInput ? 13 : undefined,
            fontFamily: 'var(--mantine-font-family)'
          }}
          className={classes.editor}
          theme={displayedTheme === 'dark' ? 'bruno-dark' : 'bruno-light'}
          loading={null} // Loading looks weird with singeline editor
          language={'plaintext'}
          value={value}
          defaultValue={defaultValue}
          onMount={onMount}
          onChange={!readOnly ? handleEditorChange : () => {}}
          height={height}
        />
      </Paper>
    </div>
  );
};
