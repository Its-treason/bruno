/*
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ActionIcon, Group, Select, Tooltip, rem } from '@mantine/core';
import { IconPencilCog } from '@tabler/icons-react';
import { useEnvironmentSelector } from '../hooks/useEnvironmentSelector';
import { EnvironmentDrawer } from 'src/feature/environment-editor';

type EnvironmentSelectorProps = {
  collection: any;
};

export const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({ collection }) => {
  const {
    activeEnvironment,
    data,
    onChange,

    environmentModalOpen,
    onEnvironmentModalOpen,
    onEnvironmentModalClose
  } = useEnvironmentSelector(collection);

  return (
    <Group gap={0} wrap="nowrap">
      <Select
        data={data}
        onChange={onChange}
        value={activeEnvironment}
        w={rem(200)}
        allowDeselect={false}
        limit={10}
        searchable
        styles={{
          input: {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0
          }
        }}
      />

      <Tooltip label="Edit environments">
        <ActionIcon
          size="input-sm"
          variant={environmentModalOpen ? 'filled' : 'default'}
          aria-label="Edit environments"
          onClick={onEnvironmentModalOpen}
          styles={{
            root: {
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderLeft: 0
            }
          }}
        >
          <IconPencilCog style={{ width: rem(18), height: rem(18) }} />
        </ActionIcon>
      </Tooltip>

      <EnvironmentDrawer collection={collection} onClose={onEnvironmentModalClose} opened={environmentModalOpen} />
    </Group>
  );
};
