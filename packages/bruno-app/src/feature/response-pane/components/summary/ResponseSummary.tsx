/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Group } from '@mantine/core';
import React from 'react';
import { ResponseTime } from './ResponseTime';
import { ResponseSize } from './ResponseSize';
import { ResponseActions } from './ResponseActions';
import { StatusCode } from './StatusCode';

type ResponseSummaryProps = {
  requestId: string;
  itemUid: string;
};

export const ResponseSummary: React.FC<ResponseSummaryProps> = ({ requestId, itemUid }) => {
  return (
    <Group gap={'xs'}>
      <StatusCode requestId={requestId} />
      <ResponseTime requestId={requestId} />
      <ResponseSize requestId={requestId} />
      <ResponseActions requestId={requestId} itemUid={itemUid} />
    </Group>
  );
};
