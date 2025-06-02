import { ActionIcon, Radio, rem, Table } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { FileBodySchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import { FilePicker } from 'components/inputs/FilePicker';
import { deleteFile, updateFile } from 'providers/ReduxStore/slices/collections';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

type FileRowProps = {
  row: FileBodySchema;
  itemUid: string;
  collectionUid: string;
  onSave: () => void;
  onRun: () => void;
};

export const FileRow: React.FC<FileRowProps> = ({ row, collectionUid, itemUid, onRun, onSave }) => {
  const dispatch = useDispatch();

  const onChange = useCallback(
    (key: keyof FileBodySchema, value: string | boolean) => {
      const file: FileBodySchema = {
        ...row,
        [key]: value
      };

      dispatch(
        updateFile({
          file,
          itemUid,
          collectionUid
        })
      );
    },
    [row]
  );

  const onRemove = useCallback(() => {
    dispatch(
      deleteFile({
        uid: row.uid,
        itemUid,
        collectionUid
      })
    );
  }, [row.uid]);

  return (
    <Table.Tr>
      <Table.Td>
        <Radio checked={row.selected} onChange={(evt) => onChange('selected', evt.currentTarget.checked)} />
      </Table.Td>
      <Table.Td>
        <FilePicker
          value={row.filePath}
          onChange={(newValue) => onChange('filePath', newValue)}
          properties={['openFile']}
          filters={[]}
          placeholder="File"
        />
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
