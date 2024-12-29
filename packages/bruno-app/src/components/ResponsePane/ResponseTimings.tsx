/*
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Title, Stack, Table } from '@mantine/core';
import { responseStore } from 'src/store/responseStore';
import { useStore } from 'zustand';

type ResponseTimingsProps = {
  itemUid: string;
};

export const ResponseTimings: React.FC<ResponseTimingsProps> = ({ itemUid }) => {
  const timings = useStore(responseStore, (state) => {
    return state.responses.get(itemUid)?.timings as unknown as Record<string, number>;
  });

  if (!timings) {
    return null;
  }

  return (
    <Stack gap={'xs'}>
      <Title order={3}>Timings</Title>
      <Table maw={'20rem'}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Duration</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <TimingRow title="Pre-Request script" timing={timings.preScript} />
          <TimingRow title="Request" timing={timings.request} />
          <TimingRow title="Parsing of response body" timing={timings.parseResponse} />
          <TimingRow title="Post-Request script" timing={timings.postScript} />
          <TimingRow title="Test" timing={timings.test} />
          <TimingRow title="Total" timing={timings.total} />
        </Table.Tbody>
      </Table>
    </Stack>
  );
};

const TimingRow: React.FC<{ timing?: number; title: string }> = ({ timing, title }) => {
  return (
    <Table.Tr>
      <Table.Td>{title}</Table.Td>
      <Table.Td>{timing != undefined ? `${timing} ms` : <i>Not executed</i>}</Table.Td>
    </Table.Tr>
  );
};
