import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import SingleLineEditor from 'src/components/CodeEditor';
import { updateCollectionAuth } from 'providers/ReduxStore/slices/collections';
import { saveCollectionRoot } from 'providers/ReduxStore/slices/collections/actions';
import StyledWrapper from './StyledWrapper';

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
      <label className="block font-medium mb-2">Username</label>
      <div className="single-line-editor-wrapper mb-2">
        <SingleLineEditor
          value={basicAuth.username || ''}
          onSave={handleSave}
          onChange={(val) => handleUsernameChange(val)}
          singleLine
          withVariables
        />
      </div>

      <label className="block font-medium mb-2">Password</label>
      <div className="single-line-editor-wrapper">
        <SingleLineEditor
          value={basicAuth.password || ''}
          onSave={handleSave}
          onChange={(val) => handlePasswordChange(val)}
          singleLine
          withVariables
        />
      </div>
    </StyledWrapper>
  );
};

export default BasicAuth;
