/*
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Stack, Title, Text } from '@mantine/core';
import { Inspector } from 'react-inspector';
import { useTheme } from 'providers/Theme';
import { ResponseTimings } from 'components/ResponsePane/ResponseTimings';

type Logs = { title: string; data: string; date: number }[];
type DebugInfo = { stage: string; logs: Logs }[];

export const DebugTab: React.FC<{ debugInfo: DebugInfo; timings: unknown; maxWidth?: number }> = ({
  debugInfo = [],
  timings,
  maxWidth
}) => {
  return (
    <Stack w={'100%'} maw={'100%'} gap={'xl'}>
      <ResponseTimings timings={timings} />
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
