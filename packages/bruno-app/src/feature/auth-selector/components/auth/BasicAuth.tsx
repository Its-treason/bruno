import { Stack } from '@mantine/core';
import { BasicAuthSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import React from 'react';

type BasicAuthProps = {
  onValueChange: (key: keyof BasicAuthSchema, value: string) => void;
  auth: BasicAuthSchema;
  onSave: () => void;
};

export const BasicAuth: React.FC<BasicAuthProps> = ({ auth, onValueChange, onSave }) => {
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
