import { Group, Radio, Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { Preferences } from '@usebruno/schema';
import React from 'react';
import { SystemProxy } from './SystemProxy';
import { ProxyPreferences } from './ProxyPreferences';

type ProxyModePreferencesProps = {
  form: UseFormReturnType<Preferences>;
};

export const ProxyModePreferences: React.FC<ProxyModePreferencesProps> = ({ form }) => {
  return (
    <Stack>
      <Radio.Group {...form.getInputProps('proxy.mode')} label="Proxy Mode">
        <Group mt="xs">
          <Radio value="off" label="Disabled" />
          <Radio value="on" label="Enabled" />
          <Radio value="system" label="System" />
        </Group>
      </Radio.Group>

      {form.getValues().proxy.mode === 'on' ? <ProxyPreferences form={form} /> : null}
      {form.getValues().proxy.mode === 'system' ? <SystemProxy /> : null}
    </Stack>
  );
};
