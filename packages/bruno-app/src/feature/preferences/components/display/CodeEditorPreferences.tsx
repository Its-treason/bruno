import { Group, NumberInput, Radio, Stack, Switch, TextInput, Title } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { Preferences } from '@usebruno/schema';
import { useTheme } from 'providers/Theme';
import React from 'react';

type DisplayPreferencesProps = {
  form: UseFormReturnType<Preferences>;
};

export const CodeEditorPreferences: React.FC<DisplayPreferencesProps> = ({ form }) => {
  return (
    <Stack mt={'md'}>
      <Title order={3}>Code editor</Title>

      <TextInput
        {...form.getInputProps('editor.fontFamily')}
        label="Font family"
        description="Leave empty for default font"
      />

      <NumberInput
        {...form.getInputProps('editor.fontSize')}
        min={8}
        max={32}
        suffix=" px"
        allowDecimal={false}
        step={2}
        label={'Font size'}
      />

      <Switch {...form.getInputProps('editor.lineWrap', { type: 'checkbox' })} label="Enable line wrap" />
      <Switch {...form.getInputProps('editor.minimap', { type: 'checkbox' })} label="Show Minimap" />
    </Stack>
  );
};
