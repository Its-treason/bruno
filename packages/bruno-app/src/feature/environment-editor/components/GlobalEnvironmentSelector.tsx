/*
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ActionIcon, Button, Divider, NavLink, Popover, ScrollArea, Space, Tooltip, rem } from '@mantine/core';
import { IconCheck, IconPencil, IconWorld } from '@tabler/icons-react';
import { useGlobalEnvironmentSelector } from '../hooks/useGlobalEnvironmentSelector';
import { GlobalEnvironmentDrawer } from './GlobalEnvironmentDrawer';
import { useState } from 'react';

export const GlobalEnvironmentSelector: React.FC = () => {
  const {
    activeEnvironment,
    data,
    onChange,

    environmentModalOpen,
    onEnvironmentModalClose,
    onEnvironmentModalOpen
  } = useGlobalEnvironmentSelector();

  const [popoverOpened, setPopoverOpened] = useState(false);

  return (
    <>
      <GlobalEnvironmentDrawer onClose={onEnvironmentModalClose} opened={environmentModalOpen} />

      <Popover width={250} opened={popoverOpened} onChange={setPopoverOpened}>
        <Popover.Target>
          <Tooltip label="Global environments" disabled={popoverOpened}>
            <ActionIcon size={'md'} variant="default" mr={'sm'} onClick={() => setPopoverOpened(!popoverOpened)}>
              <IconWorld style={{ width: rem(16) }} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        </Popover.Target>
        <Popover.Dropdown p={6}>
          <Button
            variant="filled"
            fullWidth
            justify="flex-start"
            onClick={() => {
              setPopoverOpened(false);
              onEnvironmentModalOpen();
            }}
            leftSection={<IconPencil />}
            mb={6}
          >
            Edit global environments
          </Button>
          <Divider />
          <ScrollArea mah={300}>
            {data?.map((item) => (
              <Button
                key={item.value}
                onClick={() => {
                  setPopoverOpened(false);
                  onChange(item.value);
                }}
                leftSection={item.value === activeEnvironment ? <IconCheck /> : null}
                variant={'subtle'}
                fullWidth
                color="gray"
                justify="start"
                my={6}
              >
                {item.label}
              </Button>
            ))}
            <Button
              onClick={() => {
                setPopoverOpened(false);
                onChange(null);
              }}
              leftSection={activeEnvironment === null ? <IconCheck /> : null}
              variant={'subtle'}
              fullWidth
              color="gray"
              justify="start"
            >
              {<i>No environment</i>}
            </Button>
          </ScrollArea>
        </Popover.Dropdown>
      </Popover>
    </>
  );
};
