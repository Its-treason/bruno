/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useMemo } from 'react';
import { RunnerResultItem } from '../../types/runner';
import { Group, RingProgress, Text } from '@mantine/core';
import runnerItemStatus from '../../util/runnerItemStatus';
import { CollectionSchema } from '@usebruno/schema';
import { flattenItems } from 'utils/collections';

type SummaryProps = {
  items: RunnerResultItem[];
  collection: CollectionSchema;
};

export const Summary: React.FC<SummaryProps> = ({ items, collection }) => {
  const total = useMemo(() => {
    return flattenItems(collection.items).filter((item) => item.type !== 'folder').length;
  }, []);

  const { passed, failed } = useMemo(() => {
    let passed = 0;
    let failed = 0;

    for (const item of items) {
      const status = runnerItemStatus(item);
      switch (status) {
        case 'passed':
          passed++;
          break;
        case 'failed':
          failed++;
          break;
      }
    }

    return { passed, failed } as const;
  }, [items]);

  return (
    <Group m={'xs'}>
      <RingProgress
        size={58}
        thickness={9}
        sections={[
          { value: Math.min(100, (passed / total) * 100), color: 'teal' },
          { value: Math.min(100, (failed / total) * 100), color: 'red' }
        ]}
      />

      <Text c={'teal'}>
        Passed: <b>{passed}</b>
      </Text>

      <Text c={'red'}>
        Failed: <b>{failed}</b>
      </Text>

      <Text>
        Total: <b>{items.length}</b>
      </Text>
    </Group>
  );
};
