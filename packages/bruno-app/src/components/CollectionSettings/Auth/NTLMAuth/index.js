import React from 'react';
import get from 'lodash/get';
import { useTheme } from 'providers/Theme';
import { useDispatch } from 'react-redux';
import { updateCollectionAuth } from 'providers/ReduxStore/slices/collections';
import { saveCollectionRoot } from 'providers/ReduxStore/slices/collections/actions';
import CodeEditor from 'components/CodeEditor';
import { Stack } from '@mantine/core';

const NTLMAuth = ({ collection }) => {
  const dispatch = useDispatch();
  const { storedTheme } = useTheme();

  const ntlmAuth = get(collection, 'root.request.auth.ntlm', {});

  const handleSave = () => dispatch(saveCollectionRoot(collection.uid));

  const handleUsernameChange = (username) => {
    dispatch(
      updateCollectionAuth({
        mode: 'ntlm',
        collectionUid: collection.uid,
        content: {
          username: username,
          password: ntlmAuth.password,
          domain: ntlmAuth.domain
        }
      })
    );
  };

  const handlePasswordChange = (password) => {
    dispatch(
      updateCollectionAuth({
        mode: 'ntlm',
        collectionUid: collection.uid,
        content: {
          username: ntlmAuth.username,
          password: password,
          domain: ntlmAuth.domain
        }
      })
    );
  };

  const handleDomainChange = (domain) => {
    dispatch(
      updateCollectionAuth({
        mode: 'ntlm',
        collectionUid: collection.uid,
        content: {
          username: ntlmAuth.username,
          password: ntlmAuth.password,
          domain: domain
        }
      })
    );
  };

  return (
    <Stack maw={'350px'}>
      <CodeEditor
        label="Username"
        value={ntlmAuth.username || ''}
        theme={storedTheme}
        onSave={handleSave}
        onChange={(val) => handleUsernameChange(val)}
        collection={collection}
        singleLine
        asInput
        withVariables
      />

      <CodeEditor
        label="Password"
        value={ntlmAuth.password || ''}
        theme={storedTheme}
        onSave={handleSave}
        onChange={(val) => handlePasswordChange(val)}
        collection={collection}
        singleLine
        asInput
        withVariables
      />

      <CodeEditor
        label="Domain"
        value={ntlmAuth.domain || ''}
        theme={storedTheme}
        onSave={handleSave}
        onChange={(val) => handleDomainChange(val)}
        collection={collection}
        singleLine
        asInput
        withVariables
      />
    </Stack>
  );
};

export default NTLMAuth;
