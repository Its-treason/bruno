import { editor } from 'monaco-editor';
import { createContext } from 'react';

export const CodeEditorVariableContext = createContext<(editor: editor.IStandaloneCodeEditor) => void>(null);
