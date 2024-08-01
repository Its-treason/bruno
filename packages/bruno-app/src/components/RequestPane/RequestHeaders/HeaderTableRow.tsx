/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ActionIcon, Checkbox, Table, rem } from '@mantine/core';
import React from 'react';
import CodeEditor from 'components/CodeEditor';
import { IconTrash } from '@tabler/icons-react';
import { CollectionSchema, HeaderSchema } from '@usebruno/schema';

type EnvironmentTableRowProps = {
  collection: CollectionSchema;
  header: HeaderSchema;
  onUpdateHeader: (newHeader: HeaderSchema) => void;
  onRemoveHeader: (headerUid: string) => void;
  onSave: () => void;
  onRun: () => void;
};

export const HeaderTableRow: React.FC<EnvironmentTableRowProps> = ({
  header,
  collection,
  onRemoveHeader,
  onUpdateHeader
}) => {
  return (
    <Table.Tr>
      <Table.Td w={0}>
        <Checkbox
          checked={header.enabled}
          aria-label="Header enabled"
          onChange={(evt) => {
            onUpdateHeader({
              ...header,
              enabled: evt.currentTarget.checked
            });
          }}
        />
      </Table.Td>
      <Table.Td>
        <CodeEditor
          value={header.name}
          onChange={(name) => {
            onUpdateHeader({
              ...header,
              name
            });
          }}
          withVariables
          singleLine
          asInput
        />
      </Table.Td>
      <Table.Td>
        <CodeEditor
          value={header.value}
          onChange={(value) => {
            onUpdateHeader({
              ...header,
              value
            });
          }}
          withVariables
          singleLine
          asInput
        />
      </Table.Td>
      <Table.Td w={0}>
        <ActionIcon aria-label="Delete header" c={'red'} variant="subtle" onClick={() => onRemoveHeader(header.uid)}>
          <IconTrash style={{ width: rem(18) }} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
};
