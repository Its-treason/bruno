/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Paper, Stack, Text, Title } from '@mantine/core';

export const EnvironmentFormEmptyState: React.FC = () => {
  return (
    <Paper maw={450} mt={'md'} withBorder>
      <Stack p={'md'} justify="center">
        <Title order={4}>No variables</Title>
        <Text c={'dimmed'}>This environment does not have any variables yet!</Text>
      </Stack>
    </Paper>
  );
};
