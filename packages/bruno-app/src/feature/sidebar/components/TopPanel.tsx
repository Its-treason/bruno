/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ActionIcon, Group, Text, Tooltip, rem } from '@mantine/core';
import { IconPackageImport, IconFolderOpen, IconPlus } from '@tabler/icons-react';
import Bruno from 'components/Bruno';

export const TopPanel: React.FC = () => {
  return (
    <Group
      justify="space-between"
      gap={0}
      p={'xs'}
      style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
    >
      <Group gap={4}>
        <Bruno width={30} />
        <Text>Bruno lazer</Text>
      </Group>

      <ActionIcon.Group>
        <Tooltip label="Import collection" openDelay={250}>
          <ActionIcon variant="default" size={'md'} aria-label={'Import collection'} onClick={() => alert('import')}>
            <IconPackageImport style={{ width: rem(16) }} stroke={1.5} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Open collection" openDelay={250}>
          <ActionIcon variant="default" size={'md'} aria-label={'Open collection'} onClick={() => alert('open')}>
            <IconFolderOpen style={{ width: rem(16) }} stroke={1.5} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Create collection" openDelay={250}>
          <ActionIcon variant="default" size={'md'} aria-label={'Create collection'} onClick={() => alert('create')}>
            <IconPlus style={{ width: rem(16) }} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      </ActionIcon.Group>
    </Group>
  );
};
