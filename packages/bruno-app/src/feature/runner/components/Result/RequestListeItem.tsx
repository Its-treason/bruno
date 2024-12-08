import React, { useMemo } from 'react';
import { RunnerResultItem } from '../../types/runner';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { findItemInCollection } from 'utils/collections';
import { Badge, Button, List, Loader, Stack, Text } from '@mantine/core';
import runnerItemStatus from '../../util/runnerItemStatus';
import { IconCircleCheck, IconCircleX, IconClockPause, IconX } from '@tabler/icons-react';

type RequestListItemProps = {
  item: RunnerResultItem;
  collection: CollectionSchema;
};

export const RequestListItem: React.FC<RequestListItemProps> = ({ item, collection }) => {
  const requestItem = useMemo(() => {
    return findItemInCollection(collection, item.uid) as RequestItemSchema;
  }, [item.uid]);

  const { status, icon, color } = useMemo(() => {
    const status = runnerItemStatus(item);

    let icon;
    let color;
    switch (status) {
      case 'delayed':
        icon = <IconClockPause />;
        color = 'gray';
        break;
      case 'running':
        icon = <Loader size={'sm'} color="orange" w={24} />;
        color = 'gray';
        break;
      case 'failed':
        icon = <IconCircleX />;
        color = 'red';
        break;
      case 'passed':
        icon = <IconCircleCheck />;
        color = 'teal';
        break;
    }

    return { status, icon, color } as const;
  }, [item.status]);

  console.log(item.assertionResults);

  return (
    <div>
      <Button variant="subtle" fullWidth ta={'left'} justify="start" leftSection={icon} color={color}>
        {requestItem.name}

        {status === 'passed' ? (
          <Badge ml={'sm'} color="teal">
            {item.responseReceived.status} {item.responseReceived?.statusText}
          </Badge>
        ) : null}
        {status === 'failed' ? (
          <Badge ml={'sm'} color="red">
            {item?.responseReceived?.status ? (
              <>
                {item.responseReceived.status} {item.responseReceived.statusText}
              </>
            ) : (
              <>Request error</>
            )}
          </Badge>
        ) : null}
      </Button>
      <List withPadding spacing={'xs'} size="xs" ml={'xl'}>
        <List.Item
          styles={{ itemIcon: { marginInlineEnd: 'var(--mantine-spacing-xs)' } }}
          c="red"
          icon={<IconX size={16} />}
        >
          Hello World
        </List.Item>
      </List>
    </div>
  );
};
