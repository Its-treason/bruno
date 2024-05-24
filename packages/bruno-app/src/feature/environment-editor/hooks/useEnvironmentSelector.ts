/*
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { selectEnvironment } from 'providers/ReduxStore/slices/collections/actions';
import { updateEnvironmentSettingsModalVisibility } from 'providers/ReduxStore/slices/app';
import { ComboboxItem } from '@mantine/core';

type Collection = {
  uid: string;
  environments: {
    uid: string;
    name: string;
  }[];
  activeEnvironmentUid: string | null;
};

type UseEnvironmentSelectorData = {
  data: ComboboxItem[];
  activeEnvironment: string | null;
  onChange: (newValue: string | null) => void;

  environmentModalOpen: boolean;
  onEnvironmentModalOpen: () => void;
  onEnvironmentModalClose: () => void;
};

export function useEnvironmentSelector(collection: Collection): UseEnvironmentSelectorData {
  const dispatch = useDispatch();

  const { data, activeEnvironment } = useMemo(() => {
    const data: ComboboxItem[] = collection.environments.map((env) => ({ label: env.name, value: env.uid }));
    data.push({ label: 'No Environment', value: '' });
    return {
      data,
      activeEnvironment: collection.activeEnvironmentUid ?? ''
    };
  }, [collection.activeEnvironmentUid, collection.environments]);

  const onChange = useCallback(
    (newValue: string | null) => {
      let newUid = newValue;
      if (!newValue) {
        newUid = undefined;
      }

      dispatch(selectEnvironment(newUid, collection.uid));
    },
    [dispatch, collection.uid]
  );

  const [environmentModalOpen, setEnvironmentModalOpen] = useState(false);
  const onEnvironmentModalOpen = useCallback(() => {
    setEnvironmentModalOpen(true);
    dispatch(updateEnvironmentSettingsModalVisibility(true));
  }, []);
  const onEnvironmentModalClose = useCallback(() => {
    setEnvironmentModalOpen(false);
    dispatch(updateEnvironmentSettingsModalVisibility(false));
  }, []);

  return {
    data,
    activeEnvironment,
    onChange,

    environmentModalOpen,
    onEnvironmentModalOpen,
    onEnvironmentModalClose
  };
}
