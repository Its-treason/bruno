/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ActionIcon, Group, Text, Tooltip, rem } from '@mantine/core';
import { IconSettings, IconCookie } from '@tabler/icons-react';
import Cookies from 'components/Cookies';
import { AppPreferencesDrawer } from 'feature/preferences';
import React from 'react';
import { GlobalEnvironmentSelector } from 'src/feature/environment-editor';
import { appStore } from 'src/store/appStore';
import { useStore } from 'zustand';

export const BottomButtons: React.FC = () => {
  const { cookiesOpen, preferencesOpen, setCookiesOpen, setPreferencesOpen } = useStore(appStore);

  return (
    <Group
      gap={0}
      p={'xs'}
      style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
      justify="space-between"
    >
      <ActionIcon.Group mr={'auto'}>
        <Tooltip label="Preferences" openDelay={250}>
          <ActionIcon variant="default" size={'md'} aria-label={'Preferences'} onClick={() => setPreferencesOpen(true)}>
            <IconSettings style={{ width: rem(16) }} stroke={1.5} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Cookies" openDelay={250}>
          <ActionIcon variant="default" size={'md'} aria-label={'Cookies'} onClick={() => setCookiesOpen(true)}>
            <IconCookie style={{ width: rem(16) }} stroke={1.5} />
          </ActionIcon>
        </Tooltip>

        <GlobalEnvironmentSelector />

        <AppPreferencesDrawer opened={preferencesOpen} onClose={() => setPreferencesOpen(false)} />
        {cookiesOpen && <Cookies onClose={() => setCookiesOpen(false)} />}
      </ActionIcon.Group>

      <Tooltip label={`Commit: ${window.BRUNO_COMMIT}`}>
        <Text size="sm">{window.BRUNO_VERSION}-lazer</Text>
      </Tooltip>
    </Group>
  );
};
