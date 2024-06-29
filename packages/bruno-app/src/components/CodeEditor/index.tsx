import { useSelector } from 'react-redux';
import Codemirror from './Codemirror';
import SingleLineEditor from './Codemirror/SingleLineEditor';
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

const CodeEditor: React.FC<CodeEditorProps> = ({
  collection,
  font = 'default',
  fontSize = 13,
  mode = 'plaintext',
  onChange,
  onRun,
  onSave,
  readOnly = false,
  theme = 'dark',
  value,
  defaultValue = undefined,
  singleLine = false,
  asInput = false,
  withVariables = false,
  allowLinebreaks = false,
  hideMinimap,
  height = '60vh'
}) => {
  const preferences = useSelector((state: any) => state.app.preferences);
  const forwardProps = {
    collection,
    font,
    fontSize,
    mode,
    onChange,
    onRun,
    onSave,
    readOnly,
    theme,
    value,
    defaultValue,
    singleLine,
    asInput,
    withVariables,
    allowLinebreaks,
    hideMinimap,
    height
  };

  if (preferences?.editor?.monaco) {
    if (singleLine) {
      return <MonacoSingleline {...forwardProps} />;
    }
    return <MonacoEditor {...forwardProps} />;
  }

  if (singleLine) {
    return <SingleLineEditor {...forwardProps} />;
  }
  return <Codemirror {...forwardProps} />;
};

export default CodeEditor;
