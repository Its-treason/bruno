/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Group, List, Text, ThemeIcon } from '@mantine/core';
import { IconCircleDashed } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { responseStore } from 'src/store/responseStore';
import { useStore } from 'zustand';

type TestResultsProps = {
  itemUid: string;
};

export const TestResults: React.FC<TestResultsProps> = ({ itemUid }) => {
  const results = useStore(responseStore, (state) => state.responses.get(itemUid)?.testResults);

  const rows = useMemo(() => {
    return (results ?? []).map((value) => (
      <List.Item
        color={value.status === 'pass' ? 'green' : 'red'}
        styles={{ itemIcon: { marginInlineEnd: 4 } }}
        icon={
          <ThemeIcon size={24} radius="xl">
            {value.status === 'pass' ? <IconCircleDashed size={18} /> : <IconCircleDashed size={18} />}
          </ThemeIcon>
        }
      >
        {value.description}
        {value.error ? (
          <Text c={'dimmed'} ml={'md'}>
            {value.error}
          </Text>
        ) : null}
      </List.Item>
    ));
  }, [results]);

  if (!results) {
    return <Text c={'dimmed'}>Test results not yet available</Text>;
  }

  if (results.length === 0) {
    return <Text c={'dimmed'}>No tests defined</Text>;
  }

  const passedTests = results.filter((result) => result.status === 'pass');
  const failedTests = results.filter((result) => result.status === 'fail');

  return (
    <>
      <Group>
        <Text c={'green'}>Passed: {passedTests.length}</Text>
        <Text c={'red'}>Failed: {failedTests.length}</Text>
      </Group>
      <List>{rows}</List>
    </>
  );
};
