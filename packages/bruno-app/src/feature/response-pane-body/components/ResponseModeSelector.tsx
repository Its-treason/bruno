/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ActionIcon, Button, Popover, Stack } from '@mantine/core';
import { IconCheck, IconSelector } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

type ResponseModeSelectorProps<T extends string> = {
  onSelect: (mode: T) => void;
  options: { label: string; value: T }[];
  selected: T;
  active: boolean;
};

export const ResponseModeSelector = <T extends string>({
  options,
  onSelect,
  selected,
  active
}: ResponseModeSelectorProps<T>) => {
  const [popoverOpened, setPopoverOpened] = useState(false);

  const label = options.find((option) => option.value === selected).label;

  const optionList = useMemo(() => {
    return options.map((option) => (
      <Button
        variant="subtle"
        onClick={() => {
          onSelect(option.value);
          setPopoverOpened(false);
        }}
        leftSection={option.value === selected ? <IconCheck /> : null}
        justify="start"
        color="gray"
      >
        {option.label}
      </Button>
    ));
  }, [options, selected]);

  return (
    <Button.Group>
      <Button size="xs" variant={active ? 'light' : 'default'} onClick={() => onSelect(selected)}>
        {label}
      </Button>
      <Popover withArrow offset={4} onChange={setPopoverOpened} opened={popoverOpened}>
        <Popover.Target>
          <ActionIcon
            size={'button-xs'}
            aria-label="Select mode"
            variant={active ? 'light' : 'default'}
            onClick={() => setPopoverOpened(!popoverOpened)}
          >
            <IconSelector />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown p={'xs'}>
          <Stack justify="start" gap={'xs'}>
            {optionList}
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Button.Group>
  );
};
