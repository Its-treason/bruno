/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React, { useEffect, useState } from 'react';
import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import { setRequestHeaders } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import CodeEditor from 'src/components/CodeEditor';
import { CollectionSchema, HeaderSchema, RequestItemSchema } from '@usebruno/schema';
import { Button, Flex, rem, Stack } from '@mantine/core';
import { IconTable } from '@tabler/icons-react';

type BulkEditEditorProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
  onUpdateMode: () => void;
};

export const BulkEditEditor: React.FC<BulkEditEditorProps> = ({ item, collection, onUpdateMode }) => {
  const dispatch = useDispatch();
  const headers: HeaderSchema[] = item.draft
    ? get(item, 'draft.request.headers', [])
    : get(item, 'request.headers', []);

  const onSave = () => dispatch(saveRequest(item.uid, collection.uid));
  const onRun = () => dispatch(sendRequest(item, collection.uid));

  const [bulkText, setBulkText] = useState('');

  useEffect(() => {
    const bulkText = headers.reduce((acc, header) => {
      if (!header.enabled || !header.name.length || !header.value.length) {
        return acc;
      }
      return acc + `${header.name}: ${header.value}\n`;
    }, '');
    setBulkText(bulkText);
  }, []);

  const handleBulkEdit = (value: string) => {
    setBulkText(value);

    const newHeaders = value
      .split(/\r?\n/)
      .map((pair) => {
        const sep = pair.indexOf(':');
        if (sep < 0) {
          return null;
        }
        return {
          name: pair.slice(0, sep).trim(),
          value: pair.slice(sep + 1).trim()
        };
      })
      .filter((header) => header !== null);

    // Readd all headers that were filtered at the beginning
    newHeaders.push(...headers.filter((header) => !header.enabled || !header.name.length || !header.value.length));

    dispatch(
      setRequestHeaders({
        collectionUid: collection.uid,
        itemUid: item.uid,
        headers: newHeaders
      })
    );
  };

  return (
    <Stack w={'100%'}>
      <Button
        variant="subtle"
        ml={'auto'}
        leftSection={<IconTable style={{ width: rem(18) }} />}
        onClick={onUpdateMode}
        size="compact-md"
      >
        Close bulk editor
      </Button>
      <Flex flex="1">
        <CodeEditor
          value={bulkText}
          onChange={(value) => handleBulkEdit(value)}
          onRun={onRun}
          onSave={onSave}
          height="100%"
          withVariables
          hideMinimap
        />
      </Flex>
    </Stack>
  );
};
