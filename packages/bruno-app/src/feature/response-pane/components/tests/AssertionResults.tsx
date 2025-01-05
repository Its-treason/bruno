/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Group, List, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconCircleCheck, IconCircleDashed, IconCircleX, IconX } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { responseStore } from 'src/store/responseStore';
import { useStore } from 'zustand';

type AssertionResultsProps = {
  itemUid: string;
};

export const AssertionResults: React.FC<AssertionResultsProps> = ({ itemUid }) => {
  const assertionResults = useStore(responseStore, (state) => state.responses.get(itemUid)?.assertionResults);

  const rows = useMemo(() => {
    return (assertionResults ?? []).map((value) => (
      <List.Item
        c={value.status === 'pass' ? 'green' : 'red'}
        styles={{ itemIcon: { marginInlineEnd: 4 } }}
        icon={
          <ThemeIcon color={value.status === 'pass' ? 'green' : 'red'} size={24} radius="xl">
            {value.status === 'pass' ? <IconCircleCheck size={18} /> : <IconCircleX size={18} />}
          </ThemeIcon>
        }
      >
        {value.lhsExpr}: {value.rhsExpr}
        {value.error ? (
          <Text c={'dimmed'} ml={'md'}>
            {value.error}
          </Text>
        ) : null}
      </List.Item>
    ));
  }, [assertionResults]);

  if (!assertionResults) {
    return <Text c={'dimmed'}>Assertion results not yet available</Text>;
  }

  if (assertionResults.length === 0) {
    return <Text c={'dimmed'}>No assertions defined</Text>;
  }

  const passedAssertions = assertionResults.filter((result) => result.status === 'pass');
  const failedAssertions = assertionResults.filter((result) => result.status === 'fail');

  return (
    <>
      <Group>
        <Text c={'green'}>Passed: {passedAssertions.length}</Text>
        <Text c={'red'}>Failed: {failedAssertions.length}</Text>
      </Group>
      <List size="md" mt={'xs'} styles={{ itemWrapper: { alignItems: 'flex-start' } }}>
        {rows}
      </List>
    </>
  );
};
