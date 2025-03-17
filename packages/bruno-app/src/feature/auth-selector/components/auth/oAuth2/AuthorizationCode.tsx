import { Stack, Switch } from '@mantine/core';
import { AuthorizationCodeGrantSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import React from 'react';

type AuthorizationCodeProps = {
  onValueChange: (key: keyof AuthorizationCodeGrantSchema, value: unknown) => void;
  auth: AuthorizationCodeGrantSchema;
  onSave: () => void;
};

export const AuthorizationCode: React.FC<AuthorizationCodeProps> = ({ auth, onValueChange, onSave }) => {
  return (
    <Stack gap={'xs'}>
      <CodeEditor
        label={'Callback URL'}
        value={auth.callbackUrl}
        onSave={onSave}
        onChange={(val) => onValueChange('callbackUrl', val)}
        singleLine
        asInput
        withVariables
      />

      <CodeEditor
        label={'Authorization URL'}
        value={auth.authorizationUrl}
        onSave={onSave}
        onChange={(val) => onValueChange('authorizationUrl', val)}
        singleLine
        asInput
        withVariables
      />

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

      <CodeEditor
        label={'State'}
        value={auth.state}
        onSave={onSave}
        onChange={(val) => onValueChange('state', val)}
        singleLine
        asInput
        withVariables
      />

      <Switch label={'Use PKCE'} onChange={() => onValueChange('pkce', !auth.pkce)} checked={auth.pkce} />
    </Stack>
  );
};
