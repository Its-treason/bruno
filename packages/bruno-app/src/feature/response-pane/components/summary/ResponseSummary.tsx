/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Group, Text } from '@mantine/core';
import React from 'react';
import { ResponseTime } from './ResponseTime';
import { ResponseSize } from './ResponseSize';
import { ResponseActions } from './ResponseActions';
import { StatusCode } from './StatusCode';
import { useStore } from 'zustand';
import { responseStore } from 'src/store/responseStore';

type ResponseSummaryProps = {
  requestId: string;
  itemUid: string;
};

export const ResponseSummary: React.FC<ResponseSummaryProps> = ({ requestId, itemUid }) => {
  const requestState = useStore(responseStore, (state) => state.responses.get(requestId)?.requestState);
  if (requestState !== 'received' && requestState !== 'cancelled') {
    return (
      <Group>
        <Text size="sm">Loading...</Text>
      </Group>
    );
  }

  return (
    <Group gap={'xs'}>
      <StatusCode requestId={requestId} />
      <ResponseTime requestId={requestId} />
      <ResponseSize requestId={requestId} />
      <ResponseActions requestId={requestId} itemUid={itemUid} />
    </Group>
  );
};
