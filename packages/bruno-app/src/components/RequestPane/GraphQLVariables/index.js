import { useDispatch } from 'react-redux';
import { updateRequestGraphqlVariables } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import CodeEditor from 'components/CodeEditor';

const GraphQLVariables = ({ variables, item, collection }) => {
  const dispatch = useDispatch();

  const onEdit = (value) => {
    dispatch(
      updateRequestGraphqlVariables({
        variables: value,
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  };

  const onRun = () => dispatch(sendRequest(item, collection.uid));
  const onSave = () => dispatch(saveRequest(item.uid, collection.uid));

  return (
    <CodeEditor
      value={variables || ''}
      onChange={onEdit}
      mode="javascript"
      onRun={onRun}
      onSave={onSave}
      height={'100%'}
    />
  );
};

export default GraphQLVariables;
