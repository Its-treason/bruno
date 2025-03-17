import { Stack } from '@mantine/core';
import { AwsV4AuthSchema, BasicAuthSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import React from 'react';

type AwsSig4Props = {
  onValueChange: (key: keyof AwsV4AuthSchema, value: string) => void;
  auth: AwsV4AuthSchema;
  onSave: () => void;
};

export const AwsSig4: React.FC<AwsSig4Props> = ({ auth, onValueChange, onSave }) => {
  return (
    <Stack gap={'xs'} maw={'350px'}>
      <CodeEditor
        label={'Access Key ID'}
        value={auth.accessKeyId}
        onSave={onSave}
        onChange={(val) => onValueChange('accessKeyId', val)}
        singleLine
        asInput
        withVariables
      />

      <CodeEditor
        label={'Secret Access Key'}
        value={auth.secretAccessKey}
        onSave={onSave}
        onChange={(val) => onValueChange('secretAccessKey', val)}
        singleLine
        asInput
        withVariables
      />

      <CodeEditor
        label={'Session Token'}
        value={auth.sessionToken}
        onSave={onSave}
        onChange={(val) => onValueChange('sessionToken', val)}
        singleLine
        asInput
        withVariables
      />

      <CodeEditor
        label={'Service'}
        value={auth.service}
        onSave={onSave}
        onChange={(val) => onValueChange('service', val)}
        singleLine
        asInput
        withVariables
      />

      <CodeEditor
        label={'Region'}
        value={auth.region}
        onSave={onSave}
        onChange={(val) => onValueChange('region', val)}
        singleLine
        asInput
        withVariables
      />

      <CodeEditor
        label={'Profile Name'}
        value={auth.profileName}
        onSave={onSave}
        onChange={(val) => onValueChange('profileName', val)}
        singleLine
        asInput
        withVariables
      />
    </Stack>
  );
};
