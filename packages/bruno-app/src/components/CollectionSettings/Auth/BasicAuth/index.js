import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import { updateCollectionAuth } from 'providers/ReduxStore/slices/collections';
import { saveCollectionRoot } from 'providers/ReduxStore/slices/collections/actions';
import StyledWrapper from './StyledWrapper';
import CodeEditor from 'src/components/CodeEditor';

const BasicAuth = ({ collection }) => {
  const dispatch = useDispatch();

  const basicAuth = get(collection, 'root.request.auth.basic', {});

  const handleSave = () => dispatch(saveCollectionRoot(collection.uid));

  const handleUsernameChange = (username) => {
    dispatch(
      updateCollectionAuth({
        mode: 'basic',
        collectionUid: collection.uid,
        content: {
          username: username,
          password: basicAuth.password
        }
      })
    );
  };

  const handlePasswordChange = (password) => {
    dispatch(
      updateCollectionAuth({
        mode: 'basic',
        collectionUid: collection.uid,
        content: {
          username: basicAuth.username,
          password: password
        }
      })
    );
  };

  return (
    <StyledWrapper className="mt-2 w-full">
      <CodeEditor
        label={'Username'}
        value={basicAuth.username || ''}
        onSave={handleSave}
        onChange={(val) => handleUsernameChange(val)}
        singleLine
        asInput
        withVariables
      />

      <CodeEditor
        label={'Password'}
        value={basicAuth.password || ''}
        onSave={handleSave}
        onChange={(val) => handlePasswordChange(val)}
        singleLine
        asInput
        withVariables
      />
    </StyledWrapper>
  );
};

export default BasicAuth;
