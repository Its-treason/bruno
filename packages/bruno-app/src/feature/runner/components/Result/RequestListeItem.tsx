/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React, { memo, useCallback, useMemo } from 'react';
import { RunnerResultItem } from '../../types/runner';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { findItemInCollection } from 'utils/collections';
import { Badge, Button, List, Loader, Spoiler, Text } from '@mantine/core';
import runnerItemStatus from '../../util/runnerItemStatus';
import { IconCheck, IconCircleCheck, IconCircleX, IconClockPause, IconX } from '@tabler/icons-react';
import { useStore } from 'zustand';
import { responseStore } from 'src/store/responseStore';
import statusCodePhraseMap from 'components/ResponsePane/StatusCode/get-status-code-phrase';

type RequestListItemProps = {
  itemUid: string;
  collection: CollectionSchema;
  onFocus: (item: string) => void;
};

export const RequestListItem: React.FC<RequestListItemProps> = memo(({ itemUid, collection, onFocus }) => {
  const name = useMemo(() => {
    const requestItem = findItemInCollection(collection, itemUid) as RequestItemSchema;
    if (!requestItem) {
      return 'N/A';
    }

    // Get the relative path
    const relativePath = requestItem.pathname.replace(collection.pathname, '');
    // The relative path will always start with a `/` or `\` depending on operating system
    const separator = relativePath.slice(0, 1);
    // Get all folder segments.
    const segments = relativePath.slice(1).split(separator);
    segments.pop(); // Remove the actual request, because it ends with .bru

    if (segments.length === 0) {
      return (
        <Text size="md" fw={700}>
          {requestItem.name}
        </Text>
      );
    }

    return (
      <>
        <Text size="sm">{segments.join(' / ')} /&nbsp;</Text>
        <Text size="sm" fw={700}>
          {requestItem.name}
        </Text>
      </>
    );
  }, [itemUid]);

  // IMPORTANT: The response is undefined at first, because the response is first added to the list and then added to the response store
  const response = useStore(responseStore, (state) => state.responses.get(itemUid));

  const resultList = useMemo(() => {
    return (
      <List withPadding spacing={'xs'} size="sm" ml={'xl'}>
        {response?.assertionResults?.map((assertion) => (
          <List.Item
            key={assertion.uid}
            styles={{ itemIcon: { marginInlineEnd: 4 } }}
            c={assertion.status === 'pass' ? 'teal' : 'red'}
            icon={assertion.status === 'pass' ? <IconCheck size={18} /> : <IconX size={18} />}
          >
            {assertion.lhsExpr} {assertion.rhsExpr}
          </List.Item>
        ))}

        {response?.testResults?.map((test) => (
          <List.Item
            key={test.uid}
            styles={{ itemIcon: { marginInlineEnd: 4 } }}
            c={test.status === 'pass' ? 'teal' : 'red'}
            icon={test.status === 'pass' ? <IconCheck size={18} /> : <IconX size={18} />}
          >
            {test.description}
          </List.Item>
        ))}
      </List>
    );
  }, [response?.testResults, response?.assertionResults]);

  const { status, icon, color } = useMemo(() => {
    const status = response ? runnerItemStatus(response) : 'running';

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
  }, [response]);

  const handleClick = useCallback(() => {
    if (response?.requestState === 'received' || response?.requestState === 'cancelled') {
      onFocus(itemUid);
    }
  }, [response?.requestState]);

  if (!response) {
    return null;
  }

  return (
    <div>
      <Button variant="subtle" fullWidth justify="start" leftSection={icon} color={color} onClick={handleClick}>
        {name}

        {status === 'passed' ? (
          <Badge ml={'sm'} color="teal">
            {response.status} {statusCodePhraseMap[response.status] ?? 'Unknown'}
          </Badge>
        ) : null}
        {status === 'failed' ? (
          <Badge ml={'sm'} color="red">
            {response?.status ? (
              <>
                {response.status} {statusCodePhraseMap[response.status] ?? 'Unknown'}
              </>
            ) : (
              <>Request error</>
            )}
          </Badge>
        ) : null}
      </Button>
      {resultList}
      {response.error ? (
        <Spoiler maxHeight={60} showLabel="Show more" hideLabel="Show less" c={'red'} ml={48}>
          <pre>{response.error}</pre>
        </Spoiler>
      ) : null}
    </div>
  );
});
