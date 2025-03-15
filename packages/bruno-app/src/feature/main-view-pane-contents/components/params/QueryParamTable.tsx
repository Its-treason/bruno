import { Table, Text } from '@mantine/core';
import { ParamSchema } from '@usebruno/schema';
import React from 'react';
import { QueryParamRow } from './QueryParamRow';

type QueryParamTableProps = {
  queryParams: ParamSchema[];
  itemUid: string;
  collectionUid: string;

  onRun: () => void;
  onSave: () => void;
};

export const QueryParamTable: React.FC<QueryParamTableProps> = ({
  collectionUid,
  itemUid,
  onRun,
  onSave,
  queryParams
}) => {
  if (queryParams.length === 0) {
    return (
      <>
        <Text size="lg">Query parameter</Text>
        <Text size="xs" c={'dimmed'}>
          This request does not have any query parameter.
        </Text>
      </>
    );
  }

  return (
    <>
      <Text size="lg">Query parameter</Text>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={'50px'} />
            <Table.Th w={'30%'}>Name</Table.Th>
            <Table.Th w={'auto'}>Value</Table.Th>
            <Table.Th w={'50px'} />
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {queryParams.map((param) => (
            <QueryParamRow
              key={param.uid}
              collectionUid={collectionUid}
              itemUid={itemUid}
              onRun={onRun}
              onSave={onSave}
              param={param}
            />
          ))}
        </Table.Tbody>
      </Table>
    </>
  );
};
