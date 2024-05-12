/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ActionIcon, Checkbox, Table, TextInput, rem } from '@mantine/core';
import React from 'react';
import { useEnvironmentEditor } from '../../hooks/useEnvironmentEditor';
import CodeEditor from 'components/CodeEditor';
import { IconTrash } from '@tabler/icons-react';
import classes from './EnvironmentTableRow.module.css';

type EnvironmentTableRowProps = {
  pos: number;
};

export const EnvironmentTableRow: React.FC<EnvironmentTableRowProps> = ({ pos }) => {
  const { form, collection } = useEnvironmentEditor();

  return (
    <Table.Tr className={classes.tableRow}>
      <Table.Td>
        <Checkbox
          {...form.getInputProps(`variables.${pos}.enabled`, { type: 'checkbox' })}
          key={form.key(`variables.${pos}.enabled`)}
        />
      </Table.Td>
      <Table.Td>
        <TextInput {...form.getInputProps(`variables.${pos}.name`)} key={form.key(`variables.${pos}.name`)} />
      </Table.Td>
      <Table.Td>
        {/* @ts-expect-error Needs be remade in ts */}
        <CodeEditor
          {...form.getInputProps(`variables.${pos}.value`)}
          key={form.key(`variables.${pos}.value`)}
          theme={'dark'}
          collection={collection}
          withVariables
          singleLine
          asInput
        />
      </Table.Td>
      <Table.Td>
        <Checkbox
          {...form.getInputProps(`variables.${pos}.secret`, { type: 'checkbox' })}
          key={form.key(`variables.${pos}.secret`)}
        />
      </Table.Td>
      <Table.Td>
        <ActionIcon
          aria-label="Delete variable"
          c={'red'}
          variant="subtle"
          onClick={() => {
            form.removeListItem('variables', pos);
          }}
        >
          <IconTrash style={{ width: rem(18) }} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
};
