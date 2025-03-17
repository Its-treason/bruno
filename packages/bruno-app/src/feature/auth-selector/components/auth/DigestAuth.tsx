import { Stack } from '@mantine/core';
import { DigestAuthSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import React from 'react';

type DigestAuth = {
  onValueChange: (key: keyof DigestAuthSchema, value: string) => void;
  auth: DigestAuthSchema;
  onSave: () => void;
};

export const DigestAuth: React.FC<DigestAuth> = ({ auth, onValueChange, onSave }) => {
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
    </Stack>
  );
};
