import { Stack, Switch } from '@mantine/core';
import { AuthorizationCodeGrantSchema, PasswordGrantSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import React from 'react';

type PasswordCredentialsProps = {
  onValueChange: (key: keyof PasswordGrantSchema, value: unknown) => void;
  auth: PasswordGrantSchema;
  onSave: () => void;
};

export const PasswordCredentials: React.FC<PasswordCredentialsProps> = ({ auth, onValueChange, onSave }) => {
  return (
    <Stack gap={'xs'}>
      <CodeEditor
        label={'Access Token URL'}
        value={auth.accessTokenUrl}
        onSave={onSave}
        onChange={(val) => onValueChange('accessTokenUrl', val)}
        singleLine
        asInput
        withVariables
      />

      <CodeEditor
        label={'Username'}
        value={auth.username}
        onSave={onSave}
        onChange={(val) => onValueChange('username', val)}
        singleLine
        asInput
        withVariables
      />

      <CodeEditor
        label={'Password'}
        value={auth.password}
        onSave={onSave}
        onChange={(val) => onValueChange('password', val)}
        singleLine
        asInput
        withVariables
      />

      <CodeEditor
        label={'Client ID'}
        value={auth.clientId}
        onSave={onSave}
        onChange={(val) => onValueChange('clientId', val)}
        singleLine
        asInput
        withVariables
      />

      <CodeEditor
        label={'Client Secret'}
        value={auth.clientSecret}
        onSave={onSave}
        onChange={(val) => onValueChange('clientSecret', val)}
        singleLine
        asInput
        withVariables
      />

      <CodeEditor
        label={'Scope'}
        value={auth.scope}
        onSave={onSave}
        onChange={(val) => onValueChange('scope', val)}
        singleLine
        asInput
        withVariables
      />
    </Stack>
  );
};
