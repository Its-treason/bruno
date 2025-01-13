import React from 'react';
import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import { updateCollectionAuth } from 'providers/ReduxStore/slices/collections';
import { saveCollectionRoot } from 'providers/ReduxStore/slices/collections/actions';
import StyledWrapper from './StyledWrapper';
import CodeEditor from 'components/CodeEditor';

const WsseAuth = ({ collection }) => {
  const dispatch = useDispatch();

  const wsseAuth = get(collection, 'root.request.auth.wsse', {});

  const handleSave = () => dispatch(saveCollectionRoot(collection.uid));

  const handleUserChange = (username) => {
    dispatch(
      updateCollectionAuth({
        mode: 'wsse',
        collectionUid: collection.uid,
        content: {
          username,
          password: wsseAuth.password
        }
      })
    );
  };

  const handlePasswordChange = (password) => {
    dispatch(
      updateCollectionAuth({
        mode: 'wsse',
        collectionUid: collection.uid,
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
          singleLine
        />
      </div>

      <label className="block font-medium mb-2">Password</label>
      <div className="single-line-editor-wrapper">
        <CodeEditor
          value={wsseAuth.password || ''}
          onSave={handleSave}
          onChange={(val) => handlePasswordChange(val)}
          singleLine
        />
      </div>
    </StyledWrapper>
  );
};

export default WsseAuth;
