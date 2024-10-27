/*
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useCallback, useMemo, useState } from 'react';
import { ComboboxItem } from '@mantine/core';
import { globalEnvironmentStore } from 'src/store/globalEnvironmentStore';
import { useStore } from 'zustand';

type UseEnvironmentSelectorData = {
  data: ComboboxItem[];
  activeEnvironment: string | null;
  onChange: (newValue: string | null) => void;

  environmentModalOpen: boolean;
  onEnvironmentModalOpen: () => void;
  onEnvironmentModalClose: () => void;
};

export function useGlobalEnvironmentSelector(): UseEnvironmentSelectorData {
  const { activeEnvironment, environments, setActiveEnvironment } = useStore(globalEnvironmentStore);

  const data = useMemo(() => {
    const data: ComboboxItem[] = [];
    environments.forEach((env) => data.push({ label: env.name, value: env.id }));
    return data;
  }, [environments]);

  const [environmentModalOpen, setEnvironmentModalOpen] = useState(false);
  const onEnvironmentModalOpen = useCallback(() => {
    setEnvironmentModalOpen(true);
  }, []);
  const onEnvironmentModalClose = useCallback(() => {
    setEnvironmentModalOpen(false);
  }, []);

  return {
    data,
    activeEnvironment,
    onChange: setActiveEnvironment,

    environmentModalOpen,
    onEnvironmentModalOpen,
    onEnvironmentModalClose
  };
}
