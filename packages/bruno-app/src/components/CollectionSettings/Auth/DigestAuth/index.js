import React from 'react';
import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import CodeEditor from 'src/components/CodeEditor';
import { updateCollectionAuth } from 'providers/ReduxStore/slices/collections';
import { saveCollectionRoot } from 'providers/ReduxStore/slices/collections/actions';
import StyledWrapper from './StyledWrapper';

const DigestAuth = ({ collection }) => {
  const dispatch = useDispatch();

  const digestAuth = get(collection, 'root.request.auth.digest', {});

  const handleSave = () => dispatch(saveCollectionRoot(collection.uid));

  const handleUsernameChange = (username) => {
    dispatch(
      updateCollectionAuth({
        mode: 'digest',
        collectionUid: collection.uid,
        content: {
          username: username,
          password: digestAuth.password
        }
      })
    );
  };

  const handlePasswordChange = (password) => {
    dispatch(
      updateCollectionAuth({
        mode: 'digest',
        collectionUid: collection.uid,
        content: {
          username: digestAuth.username,
          password: password
        }
      })
    );
  };

  return (
    <StyledWrapper className="mt-2 w-full">
      <label className="block font-medium mb-2">Username</label>
      <div className="single-line-editor-wrapper mb-2">
        <CodeEditor
          singleLine
          withVariables
          value={digestAuth.username || ''}
          onSave={handleSave}
          onChange={(val) => handleUsernameChange(val)}
        />
      </div>

      <label className="block font-medium mb-2">Password</label>
      <div className="single-line-editor-wrapper">
        <CodeEditor
          singleLine
          withVariables
          value={digestAuth.password || ''}
          onSave={handleSave}
          onChange={(val) => handlePasswordChange(val)}
        />
      </div>
    </StyledWrapper>
  );
};

export default DigestAuth;
