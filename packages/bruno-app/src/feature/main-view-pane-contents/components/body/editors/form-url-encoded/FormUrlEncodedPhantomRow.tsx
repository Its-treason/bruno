import { Table } from '@mantine/core';
import { FormUrlEncodedBodySchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import { addFormUrlEncodedParam } from 'providers/ReduxStore/slices/collections';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

type FormUrlEncodedPhantomRowProps = {
  itemUid: string;
  collectionUid: string;
  onSave: () => void;
  onRun: () => void;
};

export const FormUrlEncodedPhantomRow: React.FC<FormUrlEncodedPhantomRowProps> = ({
  collectionUid,
  itemUid,
  onRun,
  onSave
}) => {
  const dispatch = useDispatch();

  const onBlur = useCallback(
    (key: keyof FormUrlEncodedBodySchema, value: string) => {
      if (value.trim().length === 0) {
        return;
      }

      dispatch(
        addFormUrlEncodedParam({
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
      </Table.Td>
      <Table.Td></Table.Td>
    </Table.Tr>
  );
};
