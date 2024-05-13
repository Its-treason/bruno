/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useCallback, useEffect, useState } from 'react';
import { CollectionEnvironment, EnvironmentEditorModalTypes, EnvironmentProviderProps } from '../types';
import { useForm } from '@mantine/form';
import { useDispatch } from 'react-redux';
import { saveEnvironment } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import { variableNameRegex } from 'utils/common/regex';

type Collection = {
  environments: CollectionEnvironment[];
  activeEnvironmentUid: string | undefined;
  uid: string;
};

export const useEnvironmentEditorProvider = (
  collection: Collection,
  closeModal: () => void
): EnvironmentProviderProps => {
  const dispatch = useDispatch();
  const [allEnvironments, setAllEnvironments] = useState<CollectionEnvironment[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<CollectionEnvironment | null>(
    collection.environments[0] ?? null
  );
  const [unsavedChangesCallback, setUnsavedChangesCallback] = useState<(() => void) | null>(null);
  const [activeModal, setActiveModal] = useState<EnvironmentEditorModalTypes>(null);

  const form = useForm<{ variables: CollectionEnvironment['variables'] }>({
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

  useEffect(() => {
    if (collection.environments.length === 0) {
      setSelectedEnvironment(null);
      return;
    }

    setAllEnvironments(collection.environments);

    // This will ensure, that there is always a corrent enrionment selected
    const foundSelectedEnv = allEnvironments.find((env) => env.name === selectedEnvironment?.name);
    if ((foundSelectedEnv === undefined || selectedEnvironment === null) && allEnvironments.length > 0) {
      setSelectedEnvironment(allEnvironments[0]);
      form.setInitialValues({ variables: structuredClone(allEnvironments[0]?.variables ?? []) });
      form.reset();
      return;
    }

    // Auto selected a newly created/cloned envrionment.
    // First check if the collection length is bigger and then find the new environmetn
    if (collection.environments.length - allEnvironments.length === 1) {
      const newEnvironment = collection.environments.find((newEnv) => {
        return !allEnvironments.find((currentEnv) => currentEnv.uid === newEnv.uid);
      });
      if (newEnvironment) {
        setSelectedEnvironment(newEnvironment);
        form.setInitialValues({ variables: structuredClone(newEnvironment.variables) });
        form.reset();
      }
    }
  }, [collection.activeEnvironmentUid, collection.environments, selectedEnvironment, allEnvironments]);

  const onSubmit = useCallback(
    (values: CollectionEnvironment['variables']) => {
      dispatch(saveEnvironment(structuredClone(values), selectedEnvironment?.uid, collection.uid))
        // @ts-expect-error
        .then(() => {
          toast.success('Changes saved successfully');
          form.setInitialValues({ variables: values });
          form.reset();
        })
        .catch((e: unknown) => {
          console.error('Could not save environment', e);
          toast.error('An error occurred while saving the changes');
        });
    },
    [selectedEnvironment, collection.uid]
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

      const newEnvironment = collection.environments.find((env) => env.uid === targetEnvironmentId);
      if (!newEnvironment) {
        throw new Error(`Could not find env "${targetEnvironmentId}" for switching`);
      }
      setSelectedEnvironment(newEnvironment);
      form.setInitialValues({ variables: structuredClone(newEnvironment.variables) });
      form.reset();
    },
    [collection.environments, form]
  );

  return {
    collection,
    allEnvironments: collection.environments,
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
