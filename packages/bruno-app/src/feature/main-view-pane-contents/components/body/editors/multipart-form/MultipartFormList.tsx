import { Table } from '@mantine/core';
import { MultipartFormBodySchema } from '@usebruno/schema';
import { useMemo } from 'react';
import { MultipartFormRow } from './MultipartFormRow';
import { MultipartFormPhantomRow } from './MultipartFormPhantomRow';

type MultipartFormListProps = {
  body: MultipartFormBodySchema[];
  itemUid: string;
  collectionUid: string;
  onSave: () => void;
  onRun: () => void;
};

export const MultipartFormList: React.FC<MultipartFormListProps> = ({
  body,
  collectionUid,
  itemUid,
  onRun,
  onSave
}) => {
  const rows = useMemo(() => {
    const rows = body.map((bodyRow) => (
      <MultipartFormRow
        key={bodyRow.uid}
        collectionUid={collectionUid}
        itemUid={itemUid}
        onRun={onRun}
        onSave={onSave}
        row={bodyRow}
      />
    ));
    rows.push(
      <MultipartFormPhantomRow
        key={`phantom-text-${rows.length}`}
        type="text"
        collectionUid={collectionUid}
        itemUid={itemUid}
        onRun={onRun}
        onSave={onSave}
      />,
      <MultipartFormPhantomRow
        key={`phantom-file-${rows.length}`}
        type="file"
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
          <Table.Th w={'40%'}>Value</Table.Th>
          <Table.Th w={'20%'}>Content-Type</Table.Th>
          <Table.Th w={50}></Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};
