/*
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Table, Text, Title } from '@mantine/core';
import React, { useMemo } from 'react';
import { responseStore } from 'src/store/responseStore';
import { useStore } from 'zustand';
import classes from './ResponseHeaders.module.scss';

type ResponseHeadersProps = {
  requestId: string;
};

export const ResponseHeaders: React.FC<ResponseHeadersProps> = ({ requestId }) => {
  const headers = useStore(responseStore, (state) => state.responses.get(requestId)?.headers) ?? {};

  const rows = useMemo(() => {
    return Object.entries(headers).map(([name, values]) => {
      return values.map((value, index) => (
        <Table.Tr key={`${name}-${index}`}>
          <Table.Td>{name}</Table.Td>
          <Table.Td>{value}</Table.Td>
        </Table.Tr>
      ));
    });
  }, [headers]);

  return (
    <>
      <Text size="lg" className={classes.text}>
        Response headers
      </Text>
      <Table striped highlightOnHover withTableBorder withColumnBorders className={classes.table}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Value</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </>
  );
};
