/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Button, Paper, Stack, Text, Title, rem } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

type EnvironmentFormEmptyStateProps = {
  onCreate: () => void;
};

export const EnvironmentFormEmptyState: React.FC<EnvironmentFormEmptyStateProps> = ({ onCreate }) => {
  return (
    <Paper maw={400} mt={'md'} withBorder>
      <Stack p={'md'} justify="center">
        <Title order={4}>No variables</Title>
        <Text c={'dimmed'}>This environment does not have any variables yet!</Text>
        <Button variant="filled" onClick={onCreate} leftSection={<IconPlus style={{ width: rem(18) }} />}>
          Create Variable
        </Button>
      </Stack>
    </Paper>
  );
};
