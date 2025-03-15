import { Code, Table, Text } from '@mantine/core';
import { ParamSchema } from '@usebruno/schema';
import React from 'react';
import { PathParamRow } from './PathParamRow';

type PathParamTableProps = {
  pathParams: ParamSchema[];
  itemUid: string;
  collectionUid: string;

  onRun: () => void;
  onSave: () => void;
};

export const PathParamTable: React.FC<PathParamTableProps> = ({
  collectionUid,
  itemUid,
  onRun,
  onSave,
  pathParams
}) => {
  if (pathParams.length === 0) {
    return (
      <>
        <Text size="lg" mt={'md'}>
          Path parameter
        </Text>
        <Text size="xs" c={'dimmed'}>
          Path variables are automatically added whenever <Code>:name</Code> is used in the URL.
          <br />
          Example: <Code>https://example.com/v1/users/:id</Code> will add a path parameter called "id".
        </Text>
      </>
    );
  }

  return (
    <>
      <Text size="lg" mt={'md'}>
        Path parameter
      </Text>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={'33%'}>Name</Table.Th>
            <Table.Th>Value</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {pathParams.map((param) => (
            <PathParamRow
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
