import { Table } from '@mantine/core';
import { FileBodySchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import { FilePicker } from 'components/inputs/FilePicker';
import { addFile } from 'providers/ReduxStore/slices/collections';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

type FilePhantomRowProps = {
  itemUid: string;
  collectionUid: string;
  onSave: () => void;
  onRun: () => void;
};

export const FilePhantomRow: React.FC<FilePhantomRowProps> = ({ collectionUid, itemUid, onRun, onSave }) => {
  const dispatch = useDispatch();

  const onBlur = useCallback(
    (key: keyof FileBodySchema, value: string) => {
      if (value.trim().length === 0) {
        return;
      }

      dispatch(
        addFile({
          default: {
            [key]: value
          },
          itemUid,
          collectionUid
        })
      );
    },
    [itemUid]
  );

  return (
    <Table.Tr>
      <Table.Td></Table.Td>
      <Table.Td>
        <FilePicker
          onChange={(newValue) => onBlur('filePath', newValue)}
          properties={['openFile']}
          filters={[]}
          placeholder="Select File..."
        />
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
