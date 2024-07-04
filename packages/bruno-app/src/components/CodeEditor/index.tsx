import { MonacoSingleline } from './Monaco/MonacoSingleline';
import { MonacoEditor } from './Monaco/Monaco';
import { CollectionSchema } from '@usebruno/schema';

type CodeEditorProps = {
  collection?: CollectionSchema;
  font?: string;
  fontSize?: number;
  mode?: string;
  onChange?: (value: any) => void;
  onRun?: () => void;
  onSave?: () => void;
  readOnly?: boolean;
  theme?: string;
  value: string;
  defaultValue?: string;
  singleLine?: boolean;
  asInput?: boolean;
  withVariables?: boolean;
  allowLinebreaks?: boolean;
  hideMinimap?: boolean;
  height?: string;
};

const CodeEditor: React.FC<CodeEditorProps> = ({ singleLine, ...forwardProps }) => {
  if (singleLine) {
    return <MonacoSingleline {...forwardProps} />;
  }
  return <MonacoEditor {...forwardProps} />;
};

export default CodeEditor;
