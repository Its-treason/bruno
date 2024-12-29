/*
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useMemo } from 'react';
import { Stack, Group, Text, Space, ThemeIcon, Alert, Spoiler, rem } from '@mantine/core';
import { IconAlertTriangle, IconHome, IconInfoCircle, IconNetwork, IconWorld, IconWorldWww } from '@tabler/icons-react';
import classes from './TimelinewNew.module.css';
import { SslInfoButton } from './SslInfo/SslInfoButton';
import { useStore } from 'zustand';
import { responseStore } from 'src/store/responseStore';
import type { RequestContext } from '@usebruno/core';

type RemoteAddressIconProps = {
  ip: string;
};

const IconStyles = { height: rem(14), width: rem(14), display: 'inline', marginBottom: 4 };

const RemoteAddressIcon: React.FC<RemoteAddressIconProps> = ({ ip }) => {
  if (ip === '127.0.0.1') {
    return <IconHome style={IconStyles} />;
  }

  // Check if IP is inside the privat address range
  if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(ip)) {
    return <IconNetwork style={IconStyles} />;
  }

  return <IconWorld style={IconStyles} />;
};

const TimelineItem: React.FC<{ item: RequestContext['timeline'][0] }> = ({ item }) => {
  const requestHeader: string[] = useMemo(() => {
    const port = item.finalOptions.port ? `:${item.finalOptions.port}` : '';
    const url = `${item.finalOptions.protocol}//${item.finalOptions.hostname}${port}${item.finalOptions.path}`;

    const data = [`${item.finalOptions.method} ${url}`];
    for (const [name, value] of Object.entries(item.finalOptions.headers)) {
      if (Array.isArray(value)) {
        for (const val of value) {
          data.push(`${name}: ${val}`);
        }
        continue;
      }
      data.push(`${name}: ${value}`);
    }

    return data;
  }, [item.finalOptions]);

  let requestData;
  if (item.requestBody !== undefined) {
    const truncated = item.requestBody.length >= 2048 ? '... (Truncated)' : '';
    requestData = `${item.requestBody}${truncated}`;
  }

  const responseHeader: string[] = useMemo(() => {
    if (!item.statusCode) {
      return [];
    }

    const data = [`HTTP/${item.httpVersion} ${item.statusCode} ${item.statusMessage}`];
    for (const [name, value] of Object.entries(item.headers ?? {})) {
      if (!Array.isArray(value)) {
        data.push(`${name}: ${value}`);
        continue;
      }
      for (const val of value) {
        data.push(`${name}: ${val}`);
      }
    }

    return data;
  }, [item.headers]);

  let responseData = null;
  if (item.responseBody !== undefined) {
    const truncated = item.responseBody.length >= 2048 ? '... (Truncated)' : '';
    responseData = `${item.responseBody}${truncated}`;
  }

  return (
    <div>
      {item.remoteAddress ? (
        <Text c={'dimmed'} size="sm" className={classes.wordWrap}>
          Connected to {item.remoteAddress} <RemoteAddressIcon ip={item.remoteAddress} /> port {item.remotePort}
        </Text>
      ) : null}
      {requestHeader.map((item, i) => (
        <Text key={item + i} c={'green'} className={classes.wordWrap}>
          <span className={classes.noUserselect}>&gt; </span>
          {item}
        </Text>
      ))}
      {requestData !== undefined ? (
        <Spoiler
          maxHeight={50}
          showLabel={'Show full request data'}
          hideLabel={'Show less'}
          c={'green'}
          fz={'md'}
          fw={'md'}
          className={classes.wordWrap}
        >
          <span className={classes.noUserselect}>&gt; </span>
          {requestData}
        </Spoiler>
      ) : null}
      <Space h={'xs'} />

      {responseHeader.map((item, i) => (
        <Text key={item + i} c={'grape'} className={classes.wordWrap}>
          <span className={classes.noUserselect}>&lt; </span>
          {item}
        </Text>
      ))}
      {responseData !== undefined ? (
        <Spoiler
          maxHeight={50}
          showLabel={'Show full response data'}
          hideLabel={'Show less'}
          c={'grape'}
          fz={'md'}
          fw={'md'}
          className={classes.wordWrap}
        >
          <span className={classes.noUserselect}>&lt; </span>
          {responseData}
        </Spoiler>
      ) : null}

      {item.error !== undefined ? (
        <Alert variant="light" color="red" radius="xs" title="Error" mt={'xs'} icon={<IconAlertTriangle />}>
          {item.error}
        </Alert>
      ) : null}
      <Group pt={'xs'} gap={'xs'}>
        {item.info !== undefined ? (
          <>
            <ThemeIcon size={'xs'} color={'gray'}>
              <IconInfoCircle />
            </ThemeIcon>
            <Text c={'dimmed'}>{item.info}</Text>
          </>
        ) : null}
        {item.sslInfo !== undefined ? <SslInfoButton sslInfo={item.sslInfo} /> : null}
      </Group>
    </div>
  );
};

type TimelineNewProps = {
  itemUid: string;
};

export const TimelineNew: React.FC<TimelineNewProps> = ({ itemUid }) => {
  const timeline = useStore(responseStore, (state) => {
    return state.responses.get(itemUid)?.timeline;
  });

  if (!timeline) {
    return <div>No timeline data available</div>;
  }

  const items = timeline.map((item, index) => {
    return <TimelineItem item={item} key={`${index}-${item.statusCode}`} />;
  });

  return (
    <Stack gap={'xl'} maw={'100%'}>
      {items}
    </Stack>
  );
};
