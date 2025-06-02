import { ActionIcon, Checkbox, rem, Table } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { FormUrlEncodedBodySchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import { deleteFormUrlEncodedParam, updateFormUrlEncodedParam } from 'providers/ReduxStore/slices/collections';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

type FormUrlEncodedRowProps = {
  row: FormUrlEncodedBodySchema;
  itemUid: string;
  collectionUid: string;
  onSave: () => void;
  onRun: () => void;
};

export const FormUrlEncodedRow: React.FC<FormUrlEncodedRowProps> = ({ row, collectionUid, itemUid, onRun, onSave }) => {
  const dispatch = useDispatch();

  const onChange = useCallback(
    (key: keyof FormUrlEncodedBodySchema, value: string | boolean) => {
      const param: FormUrlEncodedBodySchema = {
        ...row,
        [key]: value
      };

      dispatch(
        updateFormUrlEncodedParam({
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
      deleteFormUrlEncodedParam({
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
      </Table.Td>
      <Table.Td>
        <ActionIcon aria-label="Delete param" color={'red'} variant="subtle" onClick={onRemove}>
          <IconTrash style={{ width: rem(18) }} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
};
