import { useSelector } from 'react-redux';
import Codemirror from './Codemirror';
import SingleLineEditor from './Codemirror/SingleLineEditor';
import { MonacoSingleline } from './Monaco/MonacoSingleline';
import { MonacoEditor } from './Monaco/Monaco';

const CodeEditor = ({
  collection,
  font,
  mode = 'plaintext',
  onChange,
  onRun,
  onSave,
  readOnly,
  theme,
  value,
  defaultValue,
  singleLine,
  asInput,
  withVariables = false,
  allowLinebreaks = false,
  height = '60vh'
}) => {
  const preferences = useSelector((state) => state.app.preferences);
  const forwardProps = {
    collection,
    font,
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
