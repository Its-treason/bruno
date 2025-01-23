import { Table, Text } from '@mantine/core';
import {
  IconSortAscending,
  IconSortAscendingLetters,
  IconSortAZ,
  IconSortDescendingLetters,
  IconSortZA
} from '@tabler/icons-react';
import { useTheme } from 'providers/Theme';
import React, { useCallback, useMemo, useState } from 'react';
import { ObjectInspector } from 'react-inspector';

type VariablesTableProps = {
  variables: { name: string; value: unknown }[];
};

export const VariablesTable: React.FC<VariablesTableProps> = ({ variables }) => {
  const theme = useTheme();
  const [sorting, setSorting] = useState<null | 'asc' | 'desc'>('asc');

  const rows = useMemo(() => {
    let sorted = variables;
    switch (sorting) {
      case 'asc':
        sorted = variables.toSorted((a, b) => a.name.localeCompare(b.name));
        break;
      case 'desc':
        sorted = variables.toSorted((a, b) => a.name.localeCompare(b.name)).reverse();
        break;
    }

    return sorted.map((variable) => (
      <Table.Tr>
        <Table.Td>{variable.name}</Table.Td>
        <Table.Td>
          <ObjectInspector theme={theme} data={variable.value} />
        </Table.Td>
      </Table.Tr>
    ));
  }, [variables, sorting]);

  const updateSorting = useCallback(() => {
    switch (sorting) {
      case 'asc':
        setSorting('desc');
        break;
      case 'desc':
        setSorting(null);
        break;
      default: // null
        setSorting('asc');
        break;
    }
  }, [sorting]);

  return (
    <Table withColumnBorders withRowBorders withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th onClick={updateSorting} style={{ cursor: 'pointer', width: '40%' }}>
            Name
            {sorting === 'asc' ? <IconSortAscendingLetters style={{ display: 'inline' }} size={17} /> : null}
            {sorting === 'desc' ? <IconSortDescendingLetters style={{ display: 'inline' }} size={17} /> : null}
          </Table.Th>
          <Table.Th>Value</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.length === 0 ? (
          <Table.Tr>
            <Table.Td colSpan={2}>
              <Text c={'red'} ta={'center'}>
                No variables
              </Text>
            </Table.Td>
          </Table.Tr>
        ) : null}
        {rows}
      </Table.Tbody>
    </Table>
  );
};
