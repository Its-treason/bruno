import { Box, Stack, Text, Title } from '@mantine/core';
import { CollectionSchema } from '@usebruno/schema';
import React, { useMemo } from 'react';
import { VariablesTable } from './VariablesTable';

type RuntimeVariablesProps = {
  collection: CollectionSchema;
};

export const RuntimeVariables: React.FC<RuntimeVariablesProps> = ({ collection }) => {
  const variables = useMemo(() => {
    return Object.entries(collection.runtimeVariables).map(([name, value]) => ({ name, value }));
  }, [collection.runtimeVariables]);

  return (
    <Stack py={'md'} gap={'xs'}>
      <Text size="lg">Runtime variables</Text>
      <Text c={'dimmed'}>
        Note: As of today, runtime variables can only be set via the API - getVar() and setVar(). In the next release,
        we will add a UI to set and modify runtime variables.
      </Text>
      <VariablesTable variables={variables} />
    </Stack>
  );
};
