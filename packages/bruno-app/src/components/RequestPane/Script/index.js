import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import CodeEditor from 'components/CodeEditor';
import { updateRequestScript, updateResponseScript } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import { Text } from '@mantine/core';
import classes from './Script.module.scss';

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
    <div className={classes.container}>
      <div>
        <Text size="xs" c={'dimmed'}>
          Pre Request
        </Text>
        <CodeEditor
          value={requestScript || ''}
          height={'100%'}
          onChange={onRequestScriptEdit}
          mode="javascript"
          onRun={onRun}
          onSave={onSave}
          extraLibs={['bru', 'req', 'res']}
        />
      </div>
      <div>
        <Text size="xs" c={'dimmed'}>
          Post Request
        </Text>
        <CodeEditor
          value={responseScript || ''}
          height={'100%'}
          onChange={onResponseScriptEdit}
          mode="javascript"
          onRun={onRun}
          onSave={onSave}
          extraLibs={['bru', 'req', 'res']}
        />
      </div>
    </div>
  );
};

export default Script;
