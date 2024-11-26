/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Stack, Loader, Text } from '@mantine/core';
import React from 'react';

export const LoadingResponse: React.FC = () => {
  return (
    <Stack align="center" mt={'xl'}>
      <Loader size={'xl'} />
      <Text>Loading response...</Text>
    </Stack>
  );
};
