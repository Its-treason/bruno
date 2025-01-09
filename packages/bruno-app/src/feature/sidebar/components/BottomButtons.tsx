/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ActionIcon, Group, Text, Tooltip, rem } from '@mantine/core';
import { IconSettings, IconCookie } from '@tabler/icons-react';
import Cookies from 'components/Cookies';
import Preferences from 'components/Preferences';
import { showPreferences } from 'providers/ReduxStore/slices/app';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GlobalEnvironmentSelector } from 'src/feature/environment-editor';

export const BottomButtons: React.FC = () => {
  const dispatch = useDispatch();

  const [cookiesOpen, setCookiesOpen] = useState(false);

  const preferencesOpen = useSelector((state: any) => state.app.showPreferences) as boolean;
  const togglePreferences = useCallback((opened: boolean) => {
    dispatch(showPreferences(opened));
  }, []);

  return (
    <Group
      gap={0}
      p={'xs'}
      style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
      justify="space-between"
    >
      <ActionIcon.Group mr={'auto'}>
        <Tooltip label="Preferences" openDelay={250}>
          <ActionIcon variant="default" size={'md'} aria-label={'Preferences'} onClick={() => togglePreferences(true)}>
            <IconSettings style={{ width: rem(16) }} stroke={1.5} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Cookies" openDelay={250}>
          <ActionIcon variant="default" size={'md'} aria-label={'Cookies'} onClick={() => setCookiesOpen(true)}>
            <IconCookie style={{ width: rem(16) }} stroke={1.5} />
          </ActionIcon>
        </Tooltip>

        <GlobalEnvironmentSelector />

        {preferencesOpen && <Preferences onClose={() => togglePreferences(false)} />}
        {cookiesOpen && <Cookies onClose={() => setCookiesOpen(false)} />}
      </ActionIcon.Group>

      <Tooltip label={`Commit: ${window.BRUNO_COMMIT}`}>
        <Text size="sm">{window.BRUNO_VERSION}-lazer</Text>
      </Tooltip>
    </Group>
  );
};
