/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ActionIcon, ActionIconGroup, Box, Button, Group, Table, Title, Tooltip, rem } from '@mantine/core';
import React, { useCallback, useMemo } from 'react';
import { useEnvironmentEditor } from '../../hooks/useEnvironmentEditor';
import { IconArrowBack, IconCopy, IconDeviceFloppy, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { EnvironmentTableRow } from './EnvironmentTableRow';
import { uuid } from 'utils/common';
import { EnvironmentFormEmptyState } from './EnvironmentFormEmptyState';
import classes from './EnvironmentTableRow.module.css';

export const EnvironmentForm: React.FC = () => {
  const { form, selectedEnvironment, onSubmit, openActionModal } = useEnvironmentEditor();
  const addRow = useCallback(() => {
    form.insertListItem('variables', { enabled: true, name: '', value: '', secret: false, uid: uuid(), type: 'text' });
  }, [form]);

  const tableRows = useMemo(() => {
    return form.values.variables.map((val, index) => <EnvironmentTableRow pos={index} key={val.uid} />);
  }, [form.values.variables.length]);

  if (!selectedEnvironment) {
    return null;
  }

  return (
    <Box p={'md'} mah={'100%'}>
      <Group gap={'xs'}>
        <Title order={3}>{selectedEnvironment.name}</Title>
        <ActionIconGroup>
          <Tooltip label="Rename environment">
            <ActionIcon aria-label="Rename environment" variant="default" onClick={() => openActionModal('rename')}>
              <IconPencil style={{ width: rem(16) }} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Clone environment">
            <ActionIcon aria-label="Clone environment" variant="default" onClick={() => openActionModal('clone')}>
              <IconCopy style={{ width: rem(16) }} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete environment">
            <ActionIcon
              aria-label="Delete environment"
              c="red"
              variant="default"
              onClick={() => openActionModal('delete')}
            >
              <IconTrash style={{ width: rem(16) }} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        </ActionIconGroup>
      </Group>
      <Group my={'md'}>
        <Button leftSection={<IconDeviceFloppy />} type="submit" form="env-edit-form">
          Save
        </Button>
        <Button onClick={addRow} leftSection={<IconPlus />} variant="subtle">
          Add variable
        </Button>

        <Button
          ml={'auto'}
          c={'red'}
          onClick={() => form.reset()}
          leftSection={<IconArrowBack />}
          variant="transparent"
        >
          Reset
        </Button>
      </Group>
      {tableRows.length > 0 ? (
        <form onSubmit={form.onSubmit((values) => onSubmit(values.variables))} id="env-edit-form">
          <Table stickyHeader>
            <Table.Thead>
              <Table.Tr className={classes.tableRow}>
                <Table.Th>Enabled</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Value</Table.Th>
                <Table.Th>Secret</Table.Th>
                <Table.Th>Delete</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{tableRows}</Table.Tbody>
          </Table>
        </form>
      ) : (
        <EnvironmentFormEmptyState />
      )}
    </Box>
  );
};
