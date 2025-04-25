import { NumberInput, Stack, Switch, Title } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconCookie } from '@tabler/icons-react';
import { Preferences } from '@usebruno/schema';
import { FilePicker } from 'components/inputs/FilePicker';
import React from 'react';

type GeneralPreferencesProps = {
  form: UseFormReturnType<Preferences>;
};

export const RequestPreferences: React.FC<GeneralPreferencesProps> = ({ form }) => {
  return (
    <Stack maw={400}>
      <Title order={3}>Request</Title>

      <Switch
        {...form.getInputProps('request.sslVerification', { type: 'checkbox' })}
        label="SSL/TLS Certificate verification"
        description="This setting only effects made by Lazer directly, not requests inside scripts. The timeline will still show a warning, if the servers certificate is invalid."
      />

      <FilePicker
        {...form.getInputProps('request.sslKeylogFile')}
        label="SSL Keylog file"
        description="All keylog Events will be written to this file for usage with Wireshark to decrypt requests"
        filters={[]}
        properties={['openFile', 'showHiddenFiles']}
      />

      <Switch
        {...form.getInputProps('request.storeCookies', { type: 'checkbox' })}
        label="Store Cookies automatically"
        description={
          <>
            Click on the <IconCookie size={16} style={{ display: 'inline' }} />
            -Icon in the bottom left corner to see stored cookies
          </>
        }
      />

      <Switch
        {...form.getInputProps('request.sendCookies', { type: 'checkbox' })}
        label="Send Cookies automatically"
        description="Lazer will create a cookie header based on Stored cookies. If the request also specifies a cookie header, both headers will be sent."
      />

      <NumberInput
        {...form.getInputProps('request.timeout')}
        // min={0}
        suffix=" ms"
        allowDecimal={false}
        thousandSeparator=","
        step={250}
        label={'Request timeout'}
      />
    </Stack>
  );
};
