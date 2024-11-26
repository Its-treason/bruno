import { Group } from '@mantine/core';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import ResponseClear from 'components/ResponsePane/ResponseClear';
import ResponseSave from 'components/ResponsePane/ResponseSave';
import ResponseSize from 'components/ResponsePane/ResponseSize';
import ResponseTime from 'components/ResponsePane/ResponseTime';
import StatusCode from 'components/ResponsePane/StatusCode';
import React from 'react';

type ResponseSummaryProps = {
  response: any;
  item: RequestItemSchema;
  collection: CollectionSchema;
};

export const ResponseSummary: React.FC<ResponseSummaryProps> = ({ response, item, collection }) => {
  return (
    <Group gap={'xs'}>
      <StatusCode status={response.status} />
      <ResponseTime duration={response.duration} />
      <ResponseSize size={response.size} />
      <ResponseClear item={item} collection={collection} />
      <ResponseSave item={item} size={response.size} />
    </Group>
  );
};
