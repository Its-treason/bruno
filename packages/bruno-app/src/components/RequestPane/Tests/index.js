import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import { updateRequestTests } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import CodeEditor from 'components/CodeEditor';

const Tests = ({ item, collection }) => {
  const dispatch = useDispatch();
  const tests = item.draft ? get(item, 'draft.request.tests') : get(item, 'request.tests');

  const onEdit = (value) => {
    dispatch(
      updateRequestTests({
        tests: value,
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  };

  const onRun = () => dispatch(sendRequest(item, collection.uid));
  const onSave = () => dispatch(saveRequest(item.uid, collection.uid));

  return (
    <div className="w-full h-full">
      <CodeEditor
        value={tests || ''}
        onChange={onEdit}
        mode="javascript"
        onRun={onRun}
        onSave={onSave}
        height={'100%'}
        extraLibs={['bru', 'chai', 'req', 'res']}
      />
    </div>
  );
};

export default Tests;
