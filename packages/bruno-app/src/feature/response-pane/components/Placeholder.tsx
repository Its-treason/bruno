/*
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Kbd, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { isMacOS } from 'utils/common/platform';
import classes from './Placeholder.module.scss';

export const Placeholder: React.FC = () => {
  const ctrlKey = useMemo(() => {
    return isMacOS() ? <Kbd>⌘</Kbd> : <Kbd>Ctrl</Kbd>;
  }, []);

  return (
    <Stack className={classes.box}>
      <IconSend size={150} strokeWidth={1} className={classes.icon} />

      <SimpleGrid cols={2} className={classes.grid}>
        <Text>Send Request</Text>
        <Text>
          {ctrlKey} + <Kbd>Enter</Kbd>
        </Text>

        <Text>New Request</Text>
        <Text>
          {ctrlKey} + <Kbd>B</Kbd>
        </Text>

        <Text>Edit Environments</Text>
        <Text>
          {ctrlKey} + <Kbd>E</Kbd>
        </Text>
      </SimpleGrid>
    </Stack>
  );
};
