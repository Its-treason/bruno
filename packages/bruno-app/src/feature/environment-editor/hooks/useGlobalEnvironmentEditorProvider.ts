/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Environment, EnvironmentEditorModalTypes, EnvironmentProviderProps, EnvironmentVariable } from '../types';
import { useForm } from '@mantine/form';
import toast from 'react-hot-toast';
import { variableNameRegex } from 'utils/common/regex';
import { globalEnvironmentStore } from 'src/store/globalEnvironmentStore';
import { original, isDraft } from 'immer';
import { useStore } from 'zustand';

export const useGlobalEnvironmentEditorProvider = (
  closeModal: () => void
): EnvironmentProviderProps => {
  const { activeEnvironment, environments, saveEnvironment } = useStore(globalEnvironmentStore);

  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(() => {
    let env = environments.get(activeEnvironment);
    if (!env) {
      return null;
    }
    return { name: env.name, id: env.id };
  });
  const [unsavedChangesCallback, setUnsavedChangesCallback] = useState<(() => void) | null>(null);
  const [activeModal, setActiveModal] = useState<EnvironmentEditorModalTypes>(null);

  const form = useForm<{ variables: EnvironmentVariable[] }>({
    mode: 'uncontrolled',
    initialValues: {
      variables: []
    },
    validate: {
      variables: {
        name: (value) => {
          if (value.trim().length === 0) {
            return 'Name cannot be empty!';
          }
          if (value.match(variableNameRegex) === null) {
            return 'Name contains invalid characters. Must only contain alphanumeric characters, "-", "_", "." and cannot start with a digit.';
          }
          return null;
        }
      }
    }
  });

  // Try to always select the active environment
  useEffect(() => {
    if (activeEnvironment === null) {
      return;
    }

    const foundSelectedEnv = environments.get(activeEnvironment);
    if (!foundSelectedEnv) {
      return;
    }

    setSelectedEnvironment(foundSelectedEnv);
    form.setInitialValues({ variables: structuredClone(foundSelectedEnv.variables) });
    form.reset();
  }, [environments, activeEnvironment]);

  useEffect(() => {
    // If the collection has no environments, reset the selected environment
    if (environments.size === 0) {
      setSelectedEnvironment(null);
      return;
    }

    const foundSelectedEnv = environments.get(selectedEnvironment?.id);

    // If the selected environment is not found in the collection, select the first one
    if (!foundSelectedEnv) {
      const env = environments.get(environments.keys().next().value)
      setSelectedEnvironment(env);
      form.setInitialValues({ variables: structuredClone(env.variables) });
      form.reset();
    }
  }, [environments, selectedEnvironment]);

  const onSubmit = useCallback(
    async (values: EnvironmentVariable[]) => {
      try {
        saveEnvironment(selectedEnvironment.id, values);
      } catch (error) {
        console.error('Could not save environment', error);
        toast.error('An error occurred while saving the changes');
        throw error;
      }
      toast.success('Changes saved successfully');
      form.setInitialValues({ variables: structuredClone(values) });
      form.reset();
    },
    [selectedEnvironment]
  );

  const onClose = useCallback(() => {
    if (form.isDirty()) {
      setUnsavedChangesCallback(() => {
        return () => closeModal();
      });
      return;
    }
    closeModal();
  }, [form, closeModal]);

  const openActionModal = useCallback(
    (modalType: EnvironmentEditorModalTypes, ignoreUnsaved = false) => {
      if (form.isDirty() && ignoreUnsaved === false) {
        setUnsavedChangesCallback(() => {
          return () => setActiveModal(modalType);
        });
        return;
      }
      setActiveModal(modalType);
    },
    [form]
  );

  const onEnvironmentSwitch = useCallback(
    (targetEnvironmentId: string, ignoreUnsaved = false) => {
      if (form.isDirty() && ignoreUnsaved === false) {
        setUnsavedChangesCallback(() => {
          return () => onEnvironmentSwitch(targetEnvironmentId, true);
        });
        return;
      }

      const newEnvironment = environments.get(targetEnvironmentId);
      if (!newEnvironment) {
        throw new Error(`Could not find env "${targetEnvironmentId}" for switching`);
      }
      setSelectedEnvironment(newEnvironment);
      form.setInitialValues({ variables: structuredClone(newEnvironment.variables) });
      form.reset();
    },
    [environments, form]
  );

  const allEnvironments = useMemo(() => {
    const list = [];
    for (const env of environments.values()) {
      list.push({ name: env.name, id: env.id } as const);
    }
    return list;
  }, [environments]);

  return {
    collection: null,
    allEnvironments,
    selectedEnvironment,
    form,

    onSubmit,
    onEnvironmentSwitch,
    onClose,

    activeModal,
    setActiveModal,
    openActionModal,

    unsavedChangesCallback,
    setUnsavedChangesCallback
  };
};
