import { Stack } from '@mantine/core';
import { BearerAuthSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import React from 'react';

type BearerTokenProps = {
  onValueChange: (key: keyof BearerAuthSchema, value: string) => void;
  auth: BearerAuthSchema;
  onSave: () => void;
};

export const BearerToken: React.FC<BearerTokenProps> = ({ auth, onValueChange, onSave }) => {
  return (
    <Stack gap={'xs'} maw={'350px'}>
      <CodeEditor
        label={'Token'}
        value={auth.token}
        onSave={onSave}
        onChange={(val) => onValueChange('token', val)}
        singleLine
        asInput
        withVariables
      />
    </Stack>
  );
};
