import { Group, NumberInput, Radio, Stack, Switch, TextInput, Title } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { Preferences } from '@usebruno/schema';
import { useTheme } from 'providers/Theme';
import React from 'react';
import { CodeEditorPreferences } from './CodeEditorPreferences';

type DisplayPreferencesProps = {
  form: UseFormReturnType<Preferences>;
};

export const DisplayPreferences: React.FC<DisplayPreferencesProps> = ({ form }) => {
  const { storedTheme, setStoredTheme } = useTheme();

  return (
    <Stack maw={400}>
      <Radio.Group label="Theme" value={storedTheme} onChange={setStoredTheme}>
        <Group mt="xs">
          <Radio value="light" label="Light" />
          <Radio value="dark" label="Dark" />
          <Radio value="system" label="System" />
        </Group>
      </Radio.Group>

      <Switch
        {...form.getInputProps('display.hideTabs', { type: 'checkbox' })}
        label="Hide Tabs"
        description="This will also increase the apps performance"
      />

      <Switch {...form.getInputProps('display.horizontalLayout', { type: 'checkbox' })} label="Horizontal layout" />

      <CodeEditorPreferences form={form} />
    </Stack>
  );
};
