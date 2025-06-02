import { Table } from '@mantine/core';
import { useMemo } from 'react';
import { FileRow } from './FileRow';
import { FilePhantomRow } from './FilePhantomRow';
import { FileBodySchema } from '@usebruno/schema';

type FileListProps = {
  body: FileBodySchema[];
  itemUid: string;
  collectionUid: string;
  onSave: () => void;
  onRun: () => void;
};

export const FileList: React.FC<FileListProps> = ({ body, collectionUid, itemUid, onRun, onSave }) => {
  const rows = useMemo(() => {
    const rows = body.map((bodyRow) => (
      <FileRow
        key={bodyRow.uid}
        collectionUid={collectionUid}
        itemUid={itemUid}
        onRun={onRun}
        onSave={onSave}
        row={bodyRow}
      />
    ));
    rows.push(
      <FilePhantomRow
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
          <Table.Th w={25}></Table.Th>
          <Table.Th w={'50%'}>File</Table.Th>
          <Table.Th>Content-Type</Table.Th>
          <Table.Th w={50}></Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};
