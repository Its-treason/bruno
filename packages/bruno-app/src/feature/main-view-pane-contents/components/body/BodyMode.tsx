import get from 'lodash/get';
import { IconWand } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { updateRequestBodyMode } from 'providers/ReduxStore/slices/collections';
import { updateRequestBody } from 'providers/ReduxStore/slices/collections/index';
import { toastError } from 'utils/common/error';
import { format, applyEdits } from 'jsonc-parser';
import xmlFormat from 'xml-formatter';
import { Button, Group, rem, Select } from '@mantine/core';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';

const bodyModeSelectData = [
  {
    group: 'Form',
    items: [
      { value: 'multipartForm', label: 'Multipart Form' },
      { value: 'formUrlEncoded', label: 'Form URL Encoded' }
    ]
  },

  {
    group: 'Raw',
    items: [
      { value: 'json', label: 'JSON' },
      { value: 'xml', label: 'XML' },
      { value: 'sparql', label: 'SPARQL' },
      { value: 'text', label: 'Text' }
    ]
  },

  { group: 'Other', items: [{ value: 'none', label: 'No Body' }] }
];

type BodyModeProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
};

export const BodyMode: React.FC<BodyModeProps> = ({ item, collection }) => {
  const dispatch = useDispatch();
  const body = item.draft ? get(item, 'draft.request.body') : get(item, 'request.body');
  const bodyMode = body?.mode;

  const onModeChange = (value) => {
    dispatch(
      updateRequestBodyMode({
        itemUid: item.uid,
        collectionUid: collection.uid,
        mode: value
      })
    );
  };

  const onPrettify = () => {
    if (body?.json && bodyMode === 'json') {
      try {
        const edits = format(body.json, undefined, { tabSize: 2, insertSpaces: true });
        const prettyBodyJson = applyEdits(body.json, edits);
        dispatch(
          updateRequestBody({
            content: prettyBodyJson,
            itemUid: item.uid,
            collectionUid: collection.uid
          })
        );
      } catch (e) {
        toastError(new Error('Unable to prettify. Invalid JSON format.'));
      }
    } else if (body?.xml && bodyMode === 'xml') {
      try {
        const prettyBodyXML = xmlFormat(body.xml, { collapseContent: true });
        dispatch(
          updateRequestBody({
            content: prettyBodyXML,
            itemUid: item.uid,
            collectionUid: collection.uid
          })
        );
      } catch (e) {
        toastError(new Error('Unable to prettify. Invalid XML format.'));
      }
    }
  };

  return (
    <Group justify="space-between">
      <Select
        size="xs"
        w={rem(170)}
        value={bodyMode}
        onChange={(newBodyMode) => onModeChange(newBodyMode)}
        data={bodyModeSelectData}
        maxDropdownHeight={300}
      />

      {bodyMode === 'json' || bodyMode === 'xml' ? (
        <Button
          variant="subtle"
          onClick={onPrettify}
          leftSection={<IconWand style={{ width: rem(18) }} />}
          size="compact-md"
        >
          Format body
        </Button>
      ) : null}
    </Group>
  );
};
