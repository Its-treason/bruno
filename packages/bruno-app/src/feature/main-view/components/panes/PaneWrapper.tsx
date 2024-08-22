import { Box, Stack, Tabs } from '@mantine/core';
import React, { ReactNode } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

type PaneWrapperProps = {
  tabs: { label: ReactNode; value: string }[];
  activeTab: string;
  onTabChange: (newTab: string) => void;
  content: ReactNode;
};

export const PaneWrapper: React.FC<PaneWrapperProps> = ({ tabs, content, activeTab, onTabChange }) => {
  return (
    <Stack h={'100%'} gap={0}>
      <Tabs value={activeTab} onChange={onTabChange}>
        <Tabs.List pl={'xs'} pr={'xs'}>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      <Box p={'xs'} flex={'1'} w={'100%'}>
        <AutoSizer disableWidth>
          {({ height }) => <section style={{ height, overflowY: 'auto' }}>{content}</section>}
        </AutoSizer>
      </Box>
    </Stack>
  );
};
