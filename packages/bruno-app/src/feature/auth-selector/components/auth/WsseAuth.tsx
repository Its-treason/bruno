import { Stack } from '@mantine/core';
import { WsseAuthSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import React from 'react';

type WsseAuthProps = {
  onValueChange: (key: keyof WsseAuthSchema, value: string) => void;
  auth: WsseAuthSchema;
  onSave: () => void;
};

export const WsseAuth: React.FC<WsseAuthProps> = ({ auth, onValueChange, onSave }) => {
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
