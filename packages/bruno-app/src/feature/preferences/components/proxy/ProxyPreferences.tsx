import { Group, NumberInput, PasswordInput, Radio, Stack, Switch, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { Preferences } from '@usebruno/schema';
import React from 'react';

type ProxyPreferencesProps = {
  form: UseFormReturnType<Preferences>;
};

export const ProxyPreferences: React.FC<ProxyPreferencesProps> = ({ form }) => {
  return (
    <Stack maw={400} mt={'md'}>
      <Radio.Group {...form.getInputProps('proxy.protocol')} label="Protocol">
        <Group mt="xs">
          <Radio value="http" label="HTTP" />
          <Radio value="https" label="HTTPS" />
          <Radio value="socks4" label="SOCKS4" />
          <Radio value="socks5" label="SOCKS5" />
        </Group>
      </Radio.Group>

      <TextInput {...form.getInputProps('proxy.hostname')} label={'Hostname'} />
      <NumberInput
        {...form.getInputProps('proxy.port')}
        min={0}
        allowDecimal={false}
        step={1}
        max={65535}
        label={'Port'}
      />

      <Switch
        {...form.getInputProps('proxy.auth.enabled', { type: 'checkbox' })}
        label="Add authentication"
        mt={'md'}
      />
      <TextInput {...form.getInputProps('proxy.auth.username')} label={'Username'} />
      <PasswordInput {...form.getInputProps('proxy.auth.password')} label={'Password'} />

      <TextInput
        {...form.getInputProps('proxy.bypassProxy')}
        label={'Proxy bypass'}
        description={'Comma separated list of Hosts where Proxy will not be used'}
        mt={'md'}
      />
    </Stack>
  );
};
