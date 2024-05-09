import { ActionIcon, Group, Select, Tooltip, rem } from '@mantine/core';
import EnvironmentSettings from './EnvironmentSettings';
import { IconPencilCog } from '@tabler/icons-react';
import { useEnvironmentSelector } from './useEnvironmentSelector';

export function EnvironmentSelector({ collection }) {
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

      {environmentModalOpen ? <EnvironmentSettings collection={collection} onClose={onEnvironmentModalClose} /> : null}
    </Group>
  );
}
