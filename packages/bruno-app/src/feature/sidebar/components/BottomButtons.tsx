/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ActionIcon, Group, Text, Tooltip, rem } from '@mantine/core';
import { IconSettings, IconCookie } from '@tabler/icons-react';
import { showPreferences } from 'providers/ReduxStore/slices/app';
import React from 'react';
import { useDispatch } from 'react-redux';

export const BottomButtons: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <Group
      gap={0}
      p={'xs'}
      style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
      justify="space-between"
    >
      <ActionIcon.Group mr={'auto'}>
        <Tooltip label="Preferences" openDelay={250}>
          <ActionIcon
            variant="default"
            size={'md'}
            aria-label={'Preferences'}
            onClick={() => dispatch(showPreferences(true))}
          >
            <IconSettings style={{ width: rem(16) }} stroke={1.5} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Cookies" openDelay={250}>
          <ActionIcon variant="default" size={'md'} aria-label={'Cookies'} onClick={() => alert('cookie dialog TODO')}>
            <IconCookie style={{ width: rem(16) }} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      </ActionIcon.Group>

      <Text size="sm">v1.18.0-lazer</Text>
    </Group>
  );
};
