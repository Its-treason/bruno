import React from 'react';
import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import CodeEditor from 'src/components/CodeEditor';
import { updateAuth } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import StyledWrapper from './StyledWrapper';

const DigestAuth = ({ item, collection }) => {
  const dispatch = useDispatch();

  const digestAuth = item.draft ? get(item, 'draft.request.auth.digest', {}) : get(item, 'request.auth.digest', {});

  const handleRun = () => dispatch(sendRequest(item, collection.uid));
  const handleSave = () => dispatch(saveRequest(item.uid, collection.uid));

  const handleUsernameChange = (username) => {
    dispatch(
      updateAuth({
        mode: 'digest',
        collectionUid: collection.uid,
        itemUid: item.uid,
        content: {
          username: username,
          password: digestAuth.password
        }
      })
    );
  };

  const handlePasswordChange = (password) => {
    dispatch(
      updateAuth({
        mode: 'digest',
        collectionUid: collection.uid,
        itemUid: item.uid,
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
          value={digestAuth.username || ''}
          onSave={handleSave}
          onChange={(val) => handleUsernameChange(val)}
          onRun={handleRun}
          singleLine
          withVariables
        />
      </div>

      <label className="block font-medium mb-2">Password</label>
      <div className="single-line-editor-wrapper">
        <CodeEditor
          value={digestAuth.password || ''}
          onSave={handleSave}
          onChange={(val) => handlePasswordChange(val)}
          onRun={handleRun}
          singleLine
          withVariables
        />
      </div>
    </StyledWrapper>
  );
};

export default DigestAuth;
