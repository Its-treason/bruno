import React from 'react';
import get from 'lodash/get';
import { useTheme } from 'providers/Theme';
import { useDispatch } from 'react-redux';
import { updateAuth } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import CodeEditor from 'components/CodeEditor';
import { Stack } from '@mantine/core';

const NTLMAuth = ({ item, collection }) => {
  const dispatch = useDispatch();
  const { storedTheme } = useTheme();

  const ntlmAuth = item.draft ? get(item, 'draft.request.auth.ntlm', {}) : get(item, 'request.auth.ntlm', {});

  const handleRun = () => dispatch(sendRequest(item, collection.uid));
  const handleSave = () => dispatch(saveRequest(item.uid, collection.uid));

  const handleUsernameChange = (username) => {
    dispatch(
      updateAuth({
        mode: 'ntlm',
        collectionUid: collection.uid,
        itemUid: item.uid,
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
      updateAuth({
        mode: 'ntlm',
        collectionUid: collection.uid,
        itemUid: item.uid,
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
      updateAuth({
        mode: 'ntlm',
        collectionUid: collection.uid,
        itemUid: item.uid,
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
