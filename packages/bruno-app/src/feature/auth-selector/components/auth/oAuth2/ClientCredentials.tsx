import { Stack, Switch } from '@mantine/core';
import { ClientCredentialsGrantSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import React from 'react';

type ClientCredentialsProps = {
  onValueChange: (key: keyof ClientCredentialsGrantSchema, value: unknown) => void;
  auth: ClientCredentialsGrantSchema;
  onSave: () => void;
};

export const ClientCredentials: React.FC<ClientCredentialsProps> = ({ auth, onValueChange, onSave }) => {
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
