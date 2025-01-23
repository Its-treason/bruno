import { Stack, Text } from '@mantine/core';
import { CollectionSchema } from '@usebruno/schema';
import React, { useMemo } from 'react';
import { VariablesTable } from './VariablesTable';

type EnvironmentVariablesProps = {
  collection: CollectionSchema;
};

export const EnvironmentVariables: React.FC<EnvironmentVariablesProps> = ({ collection }) => {
  const envData = useMemo(() => {
    const environment = collection.environments.find((env) => env.uid === collection.activeEnvironmentUid);
    if (!environment) {
      return null;
    }

    const variables = environment.variables.map((variable) => ({ name: variable.name, value: variable.value }));

    return {
      variables,
      name: environment.name
    };
  }, [collection.activeEnvironmentUid, collection.environments]);

  return (
    <Stack py={'md'} gap={'xs'}>
      <Text size="lg">Environment variables</Text>
      {envData === null ? (
        <Text c={'red'}>No environment selected!</Text>
      ) : (
        <>
          <Text c={'dimmed'}>Active environment: {envData.name}</Text>
          <VariablesTable variables={envData.variables} />
        </>
      )}
    </Stack>
  );
};
