import { ComboboxData, Select, Stack } from '@mantine/core';
import { ApiKeyAuthSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import React from 'react';

const apiKeyAuthPlacement: ComboboxData = [
  { label: 'Header', value: 'header' },
  { label: 'Query parameter', value: 'queryparams' }
];

type ApiKeyAuthProps = {
  onValueChange: (key: keyof ApiKeyAuthSchema, value: string) => void;
  auth: ApiKeyAuthSchema;
  onSave: () => void;
};

export const ApiKeyAuth: React.FC<ApiKeyAuthProps> = ({ auth, onValueChange, onSave }) => {
  return (
    <Stack gap={'xs'} maw={'350px'}>
      <CodeEditor
        label={'Key'}
        value={auth.key}
        onSave={onSave}
        onChange={(val) => onValueChange('key', val)}
        singleLine
        asInput
        withVariables
      />

      <CodeEditor
        label={'Value'}
        value={auth.value}
        onSave={onSave}
        onChange={(val) => onValueChange('value', val)}
        singleLine
        asInput
        withVariables
      />

      <Select
        size="compact-md"
        data={apiKeyAuthPlacement}
        value={auth.placement}
        allowDeselect={false}
        onChange={(value) => onValueChange('placement', value)}
      />
    </Stack>
  );
};
