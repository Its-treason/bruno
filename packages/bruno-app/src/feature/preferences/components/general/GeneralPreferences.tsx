import { Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { Preferences } from '@usebruno/schema';
import React from 'react';
import { RequestPreferences } from './RequestPreferences';
import { CustomCaPreferences } from './CustomCaPreferences';

type GeneralPreferencesProps = {
  form: UseFormReturnType<Preferences>;
};

export const GeneralPreferences: React.FC<GeneralPreferencesProps> = ({ form }) => {
  return (
    <Stack>
      <RequestPreferences form={form} />
      <CustomCaPreferences form={form} />
    </Stack>
  );
};
