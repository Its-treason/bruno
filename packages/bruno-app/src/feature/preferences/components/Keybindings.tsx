import { Kbd, Table } from '@mantine/core';
import { getKeyBindingsForOS } from 'providers/Hotkeys/keyMappings';
import React, { ReactNode, useMemo } from 'react';
import { isMacOS } from 'utils/common/platform';

export const Keybindings: React.FC = () => {
  const keyMapping = getKeyBindingsForOS(isMacOS() ? 'mac' : 'windows') as Record<
    string,
    { keys: string; name: string }
  >;

  const bindings = useMemo(() => {
    return Object.values(keyMapping).map(({ name, keys }) => {
      return [name, keys.split('+').map((key) => <Kbd mr={'xs'}>{key}</Kbd>)] as ReactNode[];
    });
  }, [keyMapping]);

  return (
    <Table
      data={{
        head: ['Name', 'Keybinding'],
        body: bindings
      }}
    />
  );
};
