import { Kbd, Table } from '@mantine/core';
import React, { ReactNode, useMemo } from 'react';
import { defaultHotkeys, defaultHotkeysMac, hotkeyDisplayNames } from 'src/common/defaultHotkeys';
import { isMacOS } from 'utils/common/platform';

export const Keybindings: React.FC = () => {
  const hotkeys = isMacOS() ? defaultHotkeysMac : defaultHotkeys;

  const bindings = useMemo(() => {
    return Object.keys(hotkeys).map((hotkeyKey) => {
      return [
        hotkeyDisplayNames[hotkeyKey],
        hotkeys[hotkeyKey].split('+').map((key) => <Kbd mr={'xs'}>{key}</Kbd>) as ReactNode[]
      ];
    });
  }, [hotkeys]);

  return (
    <Table
      data={{
        head: ['Name', 'Keybinding'],
        body: bindings
      }}
    />
  );
};
