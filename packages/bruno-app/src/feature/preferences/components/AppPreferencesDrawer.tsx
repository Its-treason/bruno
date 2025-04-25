import { Button, Drawer, Group, Tabs } from '@mantine/core';
import React, { useCallback, useMemo, useState } from 'react';
import { usePreferencesForm } from '../hooks/usePreferencesForm';
import { GeneralPreferences } from './general/GeneralPreferences';
import { DisplayPreferences } from './display/DisplayPreferences';
import { ProxyModePreferences } from './proxy/ProxyModePreferences';
import { Keybindings } from './Keybindings';
import { About } from './About';
import { IconDeviceFloppy, IconX } from '@tabler/icons-react';
import styles from './AppPreferencesDrawer.module.scss';
import toast from 'react-hot-toast';

type AppPreferencesDrawerProps = {
  opened: boolean;
  onClose: () => void;
};

export const AppPreferencesDrawer: React.FC<AppPreferencesDrawerProps> = ({ opened, onClose }) => {
  const [form, mutation] = usePreferencesForm();
  const [selectedTab, setSelectedTab] = useState('general');

  const contents = useMemo(() => {
    switch (selectedTab) {
      case 'general':
        return <GeneralPreferences form={form} />;
      case 'display':
        return <DisplayPreferences form={form} />;
      case 'proxy':
        return <ProxyModePreferences form={form} />;
      case 'keybindings':
        return <Keybindings />;
      case 'about':
        return <About />;
    }
  }, [selectedTab, form]);

  const onTabChange = useCallback((newTab: string) => {
    if (form.validate().hasErrors) {
      toast.error('Please fix form errors first');
      return;
    }
    setSelectedTab(newTab);
  }, []);

  return (
    <Drawer
      opened={opened}
      title={'Preferences'}
      size={'xl'}
      keepMounted={false}
      withCloseButton={false}
      position="right"
      classNames={{ body: styles.drawerBody }}
      onClose={() => {}}
    >
      <form className={styles.form} onSubmit={form.onSubmit((values) => mutation.mutateAsync(values).then(onClose))}>
        <Tabs value={selectedTab} onChange={onTabChange}>
          <Tabs.List>
            <Tabs.Tab value="general">General</Tabs.Tab>
            <Tabs.Tab value="display">Display</Tabs.Tab>
            <Tabs.Tab value="proxy">Proxy</Tabs.Tab>
            <Tabs.Tab value="keybindings">Keybindings</Tabs.Tab>
            <Tabs.Tab value="about">About</Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <div className={styles.preferencesBody}>{contents}</div>
        <div className={styles.bottomButtons}>
          <Button type="submit" leftSection={<IconDeviceFloppy />}>
            Save{form.isDirty() ? '*' : null}
          </Button>
          <Button
            variant="transparent"
            leftSection={<IconX />}
            onClick={() => {
              form.reset();
              onClose();
            }}
          >
            Close & discard
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
