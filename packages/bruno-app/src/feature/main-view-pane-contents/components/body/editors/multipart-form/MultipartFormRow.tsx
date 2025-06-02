import { ActionIcon, Checkbox, rem, Table } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { MultipartFormBodySchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import { FilePicker } from 'components/inputs/FilePicker';
import {
  deleteFormUrlEncodedParam,
  deleteMultipartFormParam,
  updateFormUrlEncodedParam,
  updateMultipartFormParam
} from 'providers/ReduxStore/slices/collections';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

type MultipartFormBodySchemaProps = {
  row: MultipartFormBodySchema;
  itemUid: string;
  collectionUid: string;
  onSave: () => void;
  onRun: () => void;
};

export const MultipartFormRow: React.FC<MultipartFormBodySchemaProps> = ({
  row,
  collectionUid,
  itemUid,
  onRun,
  onSave
}) => {
  const dispatch = useDispatch();

  const onChange = useCallback(
    (key: keyof MultipartFormBodySchema, value: string | boolean | string[]) => {
      const param: MultipartFormBodySchema = {
        ...row,
        [key]: value
      };

      dispatch(
        updateMultipartFormParam({
          param,
          itemUid,
          collectionUid
        })
      );
    },
    [row]
  );

  const onRemove = useCallback(() => {
    dispatch(
      deleteMultipartFormParam({
        paramUid: row.uid,
        itemUid,
        collectionUid
      })
    );
  }, [row.uid]);

  return (
    <Table.Tr>
      <Table.Td>
        <Checkbox checked={row.enabled} onChange={(evt) => onChange('enabled', evt.currentTarget.checked)} />
      </Table.Td>
      <Table.Td>
        <CodeEditor
          value={row.name}
          onSave={onSave}
          onRun={onRun}
          onChange={(newValue) => onChange('name', newValue)}
          placeholder="Name"
          allowLinebreaks
          singleLine
          withVariables
          asInput
        />
      </Table.Td>
      <Table.Td>
        {row.type === 'text' ? (
          <CodeEditor
            value={row.value}
            onSave={onSave}
            onRun={onRun}
            onChange={(newValue) => onChange('value', newValue)}
            placeholder="Value"
            allowLinebreaks
            singleLine
            withVariables
            asInput
          />
        ) : (
          <FilePicker
            value={row.value[0]}
            onChange={(newValue) => onChange('value', [newValue])}
            properties={['openFile']}
            filters={[]}
            placeholder="File"
          />
        )}
      </Table.Td>
      <Table.Td>
        <CodeEditor
          value={row.contentType}
          onSave={onSave}
          onRun={onRun}
          onChange={(newValue) => onChange('contentType', newValue)}
          placeholder="Content-Type"
          allowLinebreaks
          singleLine
          withVariables
          asInput
        />
      </Table.Td>
      <Table.Td>
        <ActionIcon aria-label="Delete param" color={'red'} variant="subtle" onClick={onRemove}>
          <IconTrash style={{ width: rem(18) }} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
};
