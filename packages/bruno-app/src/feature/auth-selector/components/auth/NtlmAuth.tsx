import { Stack } from '@mantine/core';
import { NtlmAuthSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import React from 'react';

type DigestAuth = {
  onValueChange: (key: keyof NtlmAuthSchema, value: string) => void;
  auth: NtlmAuthSchema;
  onSave: () => void;
};

export const NtlmAuth: React.FC<DigestAuth> = ({ auth, onValueChange, onSave }) => {
  return (
    <Stack gap={'xs'} maw={'350px'}>
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
        label={'Domain'}
        value={auth.domain}
        onSave={onSave}
        onChange={(val) => onValueChange('domain', val)}
        singleLine
        asInput
        withVariables
      />
    </Stack>
  );
};
