import { Stack, Switch, Title } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { Preferences } from '@usebruno/schema';
import { FilePicker } from 'components/inputs/FilePicker';
import React from 'react';

type CustomCaPreferencesProps = {
  form: UseFormReturnType<Preferences>;
};

export const CustomCaPreferences: React.FC<CustomCaPreferencesProps> = ({ form }) => {
  return (
    <Stack mt={'md'} maw={400}>
      <Title order={3}>Custom CA Certificate</Title>

      <Switch
        {...form.getInputProps('request.customCaCertificate.enabled', { type: 'checkbox' })}
        label="Use custom CA certificate"
      />

      <FilePicker
        {...form.getInputProps('request.customCaCertificate.filePath')}
        label={'CA Certificate location'}
        placeholder={'Path to ca certificate'}
        filters={[
          {
            name: 'Certificate Files',
            extensions: ['crt', 'cert', 'pem', 'der', 'p12', 'pfx', 'cer', 'key']
          },
          { name: 'All Files', extensions: ['*'] }
        ]}
        properties={['openFile', 'showHiddenFiles']}
      />

      <Switch
        {...form.getInputProps('request.keepDefaultCaCertificates.enabled', { type: 'checkbox' })}
        label="Keep default CA certificates"
        description="Recommended because requests to servers without your CA certificate won't work."
      />
    </Stack>
  );
};
