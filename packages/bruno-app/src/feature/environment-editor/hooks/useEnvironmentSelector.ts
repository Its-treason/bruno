/*
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { selectEnvironment } from 'providers/ReduxStore/slices/collections/actions';
import { updateEnvironmentSettingsModalVisibility } from 'providers/ReduxStore/slices/app';
import { ComboboxItem } from '@mantine/core';
import { CollectionInfo } from 'src/store/collectionStore';

type UseEnvironmentSelectorData = {
  data: ComboboxItem[];
  activeEnvironment: string | null;
  onChange: (newValue: string | null) => void;

  environmentModalOpen: boolean;
  onEnvironmentModalOpen: () => void;
  onEnvironmentModalClose: () => void;
};

export function useEnvironmentSelector(collection: CollectionInfo): UseEnvironmentSelectorData {
  const dispatch = useDispatch();

  const { data, activeEnvironment } = useMemo(() => {
    const data: ComboboxItem[] = [];
    collection.environments.forEach((value) => {
      data.push({
        label: value.name,
        value: value.id
      });
    });
    data.push({ label: 'No Environment', value: '' });
    return {
      data,
      activeEnvironment: collection.activeEnvironmentId ?? ''
    };
  }, [collection.activeEnvironmentId, collection.environments]);

  const onChange = useCallback(
    (newValue: string | null) => {
      let newUid = newValue;
      if (!newValue) {
        newUid = undefined;
      }

      dispatch(selectEnvironment(newUid, collection.id));
    },
    [dispatch, collection.id]
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
