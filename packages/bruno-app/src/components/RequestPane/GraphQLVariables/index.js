import { useDispatch } from 'react-redux';
import { updateRequestGraphqlVariables } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import StyledWrapper from './StyledWrapper';
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
    <StyledWrapper className="w-full">
      <CodeEditor
        value={variables || ''}
        onChange={onEdit}
        mode="javascript"
        onRun={onRun}
        onSave={onSave}
        height={'calc(100% - var(--mantine-spacing-xs))'}
      />
    </StyledWrapper>
  );
};

export default GraphQLVariables;
