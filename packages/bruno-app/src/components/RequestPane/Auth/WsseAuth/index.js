import React from 'react';
import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import { updateAuth } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import StyledWrapper from './StyledWrapper';
import CodeEditor from 'components/CodeEditor';

const WsseAuth = ({ item, collection }) => {
  const dispatch = useDispatch();

  const wsseAuth = item.draft ? get(item, 'draft.request.auth.wsse', {}) : get(item, 'request.auth.wsse', {});

  const handleRun = () => dispatch(sendRequest(item, collection.uid));
  const handleSave = () => dispatch(saveRequest(item.uid, collection.uid));

  const handleUserChange = (username) => {
    dispatch(
      updateAuth({
        mode: 'wsse',
        collectionUid: collection.uid,
        itemUid: item.uid,
        content: {
          username,
          password: wsseAuth.password
        }
      })
    );
  };

  const handlePasswordChange = (password) => {
    dispatch(
      updateAuth({
        mode: 'wsse',
        collectionUid: collection.uid,
        itemUid: item.uid,
        content: {
          username: wsseAuth.username,
          password
        }
      })
    );
  };

  return (
    <StyledWrapper className="mt-2 w-full">
      <label className="block font-medium mb-2">Username</label>
      <div className="single-line-editor-wrapper mb-2">
        <CodeEditor
          value={wsseAuth.username || ''}
          onSave={handleSave}
          onChange={(val) => handleUserChange(val)}
          onRun={handleRun}
          singleLine
        />
      </div>

      <label className="block font-medium mb-2">Password</label>
      <div className="single-line-editor-wrapper">
        <CodeEditor
          value={wsseAuth.password || ''}
          onSave={handleSave}
          onChange={(val) => handlePasswordChange(val)}
          onRun={handleRun}
          singleLine
        />
      </div>
    </StyledWrapper>
  );
};

export default WsseAuth;
