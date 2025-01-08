/*
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Stack, Title, Text } from '@mantine/core';
import { Inspector } from 'react-inspector';
import { useTheme } from 'providers/Theme';
import { useStore } from 'zustand';
import { responseStore } from 'src/store/responseStore';
import { ResponseTimings } from './ResponseTimings';

type Logs = { title: string; data: string; date: number }[];
export type DebugInfo = { stage: string; logs: Logs }[];

type DebugProps = {
  requestId: string;
};

export const Debug: React.FC<DebugProps> = ({ requestId }) => {
  const debugInfo =
    useStore(responseStore, (state) => {
      return state.responses.get(requestId)?.debug;
    }) ?? [];

  return (
    <Stack w={'100%'} gap={'xl'} h={'100%'} style={{ overflow: 'auto' }}>
      <ResponseTimings requestId={requestId} />
      {debugInfo.map(({ stage, logs }) => (
        <div key={stage}>
          <Title key={stage} order={3} mb={'xs'}>
            {stage}
          </Title>
          <Stack>
            <LogList logs={logs} />
          </Stack>
        </div>
      ))}
    </Stack>
  );
};

const LogList: React.FC<{ logs: Logs }> = ({ logs }) => {
  const { storedTheme } = useTheme();

  const reactInspectorTheme = storedTheme === 'light' ? 'chromeLight' : 'chromeDark';

  return logs.map(({ title, date, data }, index) => (
    <div key={`${title}-${index}`}>
      <Title order={4}>{title}</Title>
      <Text size={'xs'} c={'dimmed'} mb={data ? 'xs' : 0}>
        Occurred on {new Date(date).toLocaleTimeString()}
      </Text>
      {data ? <Inspector data={data} table={false} theme={reactInspectorTheme} /> : null}
    </div>
  ));
};
