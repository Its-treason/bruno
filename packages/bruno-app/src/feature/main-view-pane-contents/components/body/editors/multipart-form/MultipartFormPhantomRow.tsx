import { ActionIcon, Checkbox, rem, Table } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { MultipartFormBodySchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import { FilePicker } from 'components/inputs/FilePicker';
import { addFormUrlEncodedParam, addMultipartFormParam } from 'providers/ReduxStore/slices/collections';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

type MultipartFormBodySchemaProps = {
  type: 'text' | 'file';
  itemUid: string;
  collectionUid: string;
  onSave: () => void;
  onRun: () => void;
};

export const MultipartFormPhantomRow: React.FC<MultipartFormBodySchemaProps> = ({
  type,
  collectionUid,
  itemUid,
  onRun,
  onSave
}) => {
  const dispatch = useDispatch();

  const onBlur = useCallback(
    (key: keyof MultipartFormBodySchema, value: string | string[]) => {
      if (value.length === 0) {
        return;
      }

      dispatch(
        addMultipartFormParam({
          default: {
            type,
            [key]: value
          },
          itemUid,
          collectionUid
        })
      );
    },
    [type, itemUid]
  );

  return (
    <Table.Tr>
      <Table.Td></Table.Td>
      <Table.Td>
        <CodeEditor
          onSave={onSave}
          onRun={onRun}
          onBlur={(newValue) => onBlur('name', newValue)}
          placeholder="Enter name..."
          allowLinebreaks
          singleLine
          withVariables
          asInput
        />
      </Table.Td>
      <Table.Td>
        {type === 'text' ? (
          <CodeEditor
            onSave={onSave}
            onRun={onRun}
            onBlur={(newValue) => onBlur('value', newValue)}
            placeholder="Enter value..."
            allowLinebreaks
            singleLine
            withVariables
            asInput
          />
        ) : (
          <FilePicker
            onChange={(newValue) => onBlur('value', [newValue])}
            properties={['openFile']}
            filters={[]}
            placeholder="Select file..."
          />
        )}
      </Table.Td>
      <Table.Td>
        <CodeEditor
          onSave={onSave}
          onRun={onRun}
          onBlur={(newValue) => onBlur('contentType', newValue)}
          placeholder="Enter Content-Type..."
          allowLinebreaks
          singleLine
          withVariables
          asInput
        />
      </Table.Td>
      <Table.Td></Table.Td>
    </Table.Tr>
  );
};
