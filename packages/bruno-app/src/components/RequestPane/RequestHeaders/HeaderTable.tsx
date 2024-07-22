/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React from 'react';
import get from 'lodash/get';
import { IconBoxMultiple, IconPlus } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { addRequestHeader, updateRequestHeader, deleteRequestHeader } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import { Button, Group, rem, Stack, Table, Text, Tooltip } from '@mantine/core';
import { CollectionSchema, HeaderSchema, RequestItemSchema } from '@usebruno/schema';
import { HeaderTableRow } from './HeaderTableRow';

type HeaderTableProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
  onUpdateMode: () => void;
};

export const HeaderTable: React.FC<HeaderTableProps> = ({ item, collection, onUpdateMode }) => {
  const dispatch = useDispatch();
  const headers = item.draft ? get(item, 'draft.request.headers', []) : get(item, 'request.headers', []);

  const onSave = () => dispatch(saveRequest(item.uid, collection.uid));
  const onRun = () => dispatch(sendRequest(item, collection.uid));

  const addHeader = () => {
    dispatch(
      addRequestHeader({
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  };

  const onUpdateHeader = (newHeader: HeaderSchema) => {
    dispatch(
      updateRequestHeader({
        header: newHeader,
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  };

  const onRemoveHeader = (headerUid: string) => {
    dispatch(
      deleteRequestHeader({
        headerUid,
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  };

  return (
    <Stack w={'100%'}>
      <Group justify="space-between">
        <Button
          variant="filled"
          size="compact-md"
          leftSection={<IconPlus style={{ width: rem(18) }} />}
          onClick={addHeader}
        >
          Add header
        </Button>
        <Button
          variant="subtle"
          size="compact-md"
          leftSection={<IconBoxMultiple style={{ width: rem(18) }} />}
          onClick={onUpdateMode}
        >
          Open bulk editor
        </Button>
      </Group>

      {headers.length > 0 ? (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Enabled</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Value</Table.Th>
              <Table.Th>Delete</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {headers.map((header) => (
              <HeaderTableRow
                key={header.uid}
                collection={collection}
                header={header}
                onRemoveHeader={onRemoveHeader}
                onUpdateHeader={onUpdateHeader}
                onRun={onRun}
                onSave={onSave}
              />
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Text w={'100%'} ta={'center'}>
          This request does not have any headers.
        </Text>
      )}
    </Stack>
  );
};
