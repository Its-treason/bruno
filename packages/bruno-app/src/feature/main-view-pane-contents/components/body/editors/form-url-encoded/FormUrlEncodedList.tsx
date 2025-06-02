import { Table } from '@mantine/core';
import { FormUrlEncodedBodySchema } from '@usebruno/schema';
import { useMemo } from 'react';
import { FormUrlEncodedRow } from './FormUrlEncodedRow';
import { FormUrlEncodedPhantomRow } from './FormUrlEncodedPhantomRow';

type FormUrlEncodedBodyProps = {
  body: FormUrlEncodedBodySchema[];
  itemUid: string;
  collectionUid: string;
  onSave: () => void;
  onRun: () => void;
};

export const FormUrlEncodedList: React.FC<FormUrlEncodedBodyProps> = ({
  body,
  collectionUid,
  itemUid,
  onRun,
  onSave
}) => {
  const rows = useMemo(() => {
    const rows = body.map((bodyRow) => (
      <FormUrlEncodedRow
        key={bodyRow.uid}
        collectionUid={collectionUid}
        itemUid={itemUid}
        onRun={onRun}
        onSave={onSave}
        row={bodyRow}
      />
    ));
    rows.push(
      <FormUrlEncodedPhantomRow
        key={`phantom-${rows.length}`}
        collectionUid={collectionUid}
        itemUid={itemUid}
        onRun={onRun}
        onSave={onSave}
      />
    );
    return rows;
  }, [body]);

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th w={46}></Table.Th>
          <Table.Th>Name</Table.Th>
          <Table.Th w={'50%'}>Value</Table.Th>
          <Table.Th w={50}></Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};
