import { MonacoSingleline } from './Monaco/MonacoSingleline';
import { MonacoEditor } from './Monaco/Monaco';
import { ComponentProps } from 'react';

type CodeEditorProps =
  | ({
      singleLine: true;
    } & ComponentProps<typeof MonacoSingleline>)
  | ({
      singleLine?: false;
    } & ComponentProps<typeof MonacoEditor>);

const CodeEditor: React.FC<CodeEditorProps> = ({ singleLine = false, ...forwardProps }) => {
  if (singleLine === true) {
    return <MonacoSingleline {...forwardProps} />;
  }
  return <MonacoEditor {...forwardProps} />;
};

export default CodeEditor;
