import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import CodeEditor from 'components/CodeEditor';
import { updateRequestScript, updateResponseScript } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import StyledWrapper from './StyledWrapper';

const Script = ({ item, collection }) => {
  const dispatch = useDispatch();
  const requestScript = item.draft ? get(item, 'draft.request.script.req') : get(item, 'request.script.req');
  const responseScript = item.draft ? get(item, 'draft.request.script.res') : get(item, 'request.script.res');

  const onRequestScriptEdit = (value) => {
    dispatch(
      updateRequestScript({
        script: value,
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  };

  const onResponseScriptEdit = (value) => {
    dispatch(
      updateResponseScript({
        script: value,
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  };

  const onRun = () => dispatch(sendRequest(item, collection.uid));
  const onSave = () => dispatch(saveRequest(item.uid, collection.uid));

  return (
    <StyledWrapper className="w-full flex flex-col">
      <div className="flex flex-col flex-1 mt-2 gap-y-2">
        <div className="title text-xs">Pre Request</div>
        <CodeEditor
          value={requestScript || ''}
          height={'25vh'}
          onChange={onRequestScriptEdit}
          mode="javascript"
          onRun={onRun}
          onSave={onSave}
        />
      </div>
      <div className="flex flex-col flex-1 mt-2 gap-y-2">
        <div className="title text-xs">Post Response</div>
        <CodeEditor
          value={responseScript || ''}
          height={'25vh'}
          onChange={onResponseScriptEdit}
          mode="javascript"
          onRun={onRun}
          onSave={onSave}
        />
      </div>
    </StyledWrapper>
  );
};

export default Script;
