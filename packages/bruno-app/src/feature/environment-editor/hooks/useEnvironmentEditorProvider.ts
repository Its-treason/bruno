/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Environment, EnvironmentEditorModalTypes, EnvironmentProviderProps, EnvironmentVariable } from '../types';
import { useForm } from '@mantine/form';
import { useDispatch } from 'react-redux';
import { saveEnvironment } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import { variableNameRegex } from 'utils/common/regex';
import { CollectionInfo } from 'src/store/collectionStore';

export const useEnvironmentEditorProvider = (
  collection: CollectionInfo,
  closeModal: () => void
): EnvironmentProviderProps => {
  const dispatch = useDispatch();
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(() => {
    const env = collection.environments[0];
    if (!env) {
      return null;
    }
    return { id: env.id, name: env.name };
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
    if (collection.activeEnvironmentId === null) {
      return;
    }

    const foundSelectedEnv = collection.environments.get(collection.activeEnvironmentId);
    if (!foundSelectedEnv) {
      return;
    }

    setSelectedEnvironment({ id: foundSelectedEnv.id, name: foundSelectedEnv.name });
    const variables: EnvironmentVariable[] = foundSelectedEnv.variables.map((env) => ({
      id: env.id,
      name: env.name,
      value: env.value,
      enabled: env.enabled,
      secret: env.secret
    }));
    form.setInitialValues({ variables });
    form.reset();
  }, [collection.activeEnvironmentId]);

  useEffect(() => {
    // If the collection has no environments, reset the selected environment
    if (collection.environments.size === 0) {
      setSelectedEnvironment(null);
      return;
    }

    const foundSelectedEnv = collection.environments.get(selectedEnvironment.id);
    // If the selected environment is not found in the collection, select the first one
    if (!foundSelectedEnv) {
      const env = collection.environments[0];
      setSelectedEnvironment({ id: env.uid, name: env.name });
      const variables: EnvironmentVariable[] = env.variables.map((env) => ({
        id: env.uid,
        name: env.name,
        value: env.value,
        enabled: env.enabled,
        secret: env.secret
      }));
      form.setInitialValues({ variables });
      form.reset();
      return;
    }
  }, [collection.environments, selectedEnvironment]);

  const onSubmit = useCallback(
    async (values: EnvironmentVariable[]) => {
      try {
        const variables = values.map((value) => ({
          uid: value.id,
          name: value.name,
          value: value.value,
          enabled: value.enabled,
          secret: value.secret,
          type: 'text'
        }));
        await dispatch(saveEnvironment(variables, selectedEnvironment?.id, collection.id));
      } catch (error) {
        console.error('Could not save environment', error);
        toast.error('An error occurred while saving the changes');
        throw error;
      }
      toast.success('Changes saved successfully');
      form.setInitialValues({ variables: values });
      form.reset();
    },
    [selectedEnvironment, collection.id]
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

      const newEnvironment = collection.environments.get(targetEnvironmentId);
      if (!newEnvironment) {
        throw new Error(`Could not find env "${targetEnvironmentId}" for switching`);
      }
      setSelectedEnvironment({ id: newEnvironment.id, name: newEnvironment.name });
      const variables: EnvironmentVariable[] = newEnvironment.variables.map((env) => ({
        id: env.id,
        name: env.name,
        value: env.value,
        enabled: env.enabled,
        secret: env.secret
      }));
      form.setInitialValues({ variables });
      form.reset();
    },
    [collection.environments, form]
  );

  const allEnvironments = useMemo(() => {
    const environments = [];
    collection.environments.forEach((env) => environments.push({ id: env.id, name: env.name }));
    return environments;
  }, [collection.environments]);

  return {
    collection,
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
