import { Group } from '@mantine/core';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import ResponseClear from 'components/ResponsePane/ResponseClear';
import ResponseSave from 'components/ResponsePane/ResponseSave';
import ResponseSize from 'components/ResponsePane/ResponseSize';
import ResponseTime from 'components/ResponsePane/ResponseTime';
import { StatusCode } from 'components/ResponsePane/StatusCode';
import React from 'react';

type ResponseSummaryProps = {
  item: RequestItemSchema;
};

export const ResponseSummary: React.FC<ResponseSummaryProps> = ({ item }) => {
  return (
    <Group gap={'xs'}>
      <StatusCode itemUid={item.uid} />
      <ResponseTime itemUid={item.uid} />
      <ResponseSize itemUid={item.uid} />
      <ResponseClear itemUid={item.uid} />
      <ResponseSave itemUid={item.uid} />
    </Group>
  );
};
