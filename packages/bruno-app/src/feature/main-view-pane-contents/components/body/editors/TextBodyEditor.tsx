import CodeEditor from 'components/CodeEditor';
import { updateRequestBody } from 'providers/ReduxStore/slices/collections';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

type TextBodyEditorProps = {
  mode: string;
  body: string;
  itemUid: string;
  collectionUid: string;
  onSave: () => void;
  onRun: () => void;
};

export const TextBodyEditor: React.FC<TextBodyEditorProps> = ({
  itemUid,
  collectionUid,
  body,
  mode,
  onRun,
  onSave
}) => {
  const dispatch = useDispatch();

  const onEdit = useCallback(
    (content: string) => {
      dispatch(
        updateRequestBody({
          content,
          itemUid,
          collectionUid
        })
      );
    },
    [itemUid, dispatch]
  );

  return (
    <CodeEditor
      value={body}
      onChange={onEdit}
      onRun={onRun}
      onSave={onSave}
      mode={mode}
      height={'100%'}
      withVariables
    />
  );
};
