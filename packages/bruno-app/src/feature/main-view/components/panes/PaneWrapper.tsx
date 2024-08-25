import { Box, Group, Stack, Tabs } from '@mantine/core';
import React, { ReactNode } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

type PaneWrapperProps = {
  tabs: { label: ReactNode; value: string }[];
  activeTab: string;
  onTabChange: (newTab: string) => void;
  aboveTabs?: ReactNode;
  content: ReactNode;
};

export const PaneWrapper: React.FC<PaneWrapperProps> = ({ aboveTabs, tabs, content, activeTab, onTabChange }) => {
  return (
    <Stack h={'100%'} gap={0}>
      {aboveTabs}
      <Tabs value={activeTab} onChange={onTabChange}>
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      <Box pt={'xs'} pb={'xs'} pl={'sm'} pr={'sm'} flex={'1'} w={'100%'}>
        <AutoSizer disableWidth>
          {({ height }) => <section style={{ height, overflowY: 'auto' }}>{content}</section>}
        </AutoSizer>
      </Box>
    </Stack>
  );
};
