import { Tabs } from '@mantine/core';
import React, { ReactNode } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import classes from './PaneWrapper.module.scss';

type PaneWrapperProps = {
  tabs: { label: ReactNode; value: string }[];
  activeTab: string;
  onTabChange: (newTab: string) => void;
  aboveTabs?: ReactNode;
  content: ReactNode;
};

export const PaneWrapper: React.FC<PaneWrapperProps> = ({ aboveTabs, tabs, content, activeTab, onTabChange }) => {
  return (
    <div className={classes.wrapper}>
      <div className={classes.header}>
        <div className={classes.aboveTabs}>{aboveTabs}</div>
        <Tabs value={activeTab} onChange={onTabChange}>
          <Tabs.List>
            {tabs.map((tab) => (
              <Tabs.Tab key={tab.value} value={tab.value}>
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
      </div>
      <div className={classes.pane}>
        <AutoSizer disableWidth>
          {({ height }) => <section style={{ height, overflowY: 'auto', overflowX: 'visible' }}>{content}</section>}
        </AutoSizer>
      </div>
    </div>
  );
};
