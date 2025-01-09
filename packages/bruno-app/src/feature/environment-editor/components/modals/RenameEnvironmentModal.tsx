/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Alert, Button, Group, Modal, Text, TextInput, rem } from '@mantine/core';
import { useEnvironmentEditor } from '../../hooks/useEnvironmentEditor';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { renameEnvironment } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import { IconAlertCircle } from '@tabler/icons-react';
import { globalEnvironmentStore } from 'src/store/globalEnvironmentStore';
import { useStore } from 'zustand';

export const RenameEnvironmentModal: React.FC = () => {
  const { activeModal, setActiveModal, selectedEnvironment, allEnvironments, collection } = useEnvironmentEditor();
  const renameGlobalEnvironment = useStore(globalEnvironmentStore, (state) => state.renameEnvironment);
  const dispatch = useDispatch();

  const renameMutation = useMutation({
    mutationFn: async (values: { name: string; environmentId: string; collectionId?: string }) => {
      if (values.collectionId) {
        await dispatch(renameEnvironment(values.name, values.environmentId, values.collectionId));
        return;
      }
      renameGlobalEnvironment(values.environmentId, values.name);
    },
    onSuccess: () => {
      toast.success('Renamed environment');
      setActiveModal(null);
    }
  });

  const renameForm = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: ''
    },
    validate: {
      name: (value) => {
        if (value.trim().length === 0) {
          return 'Name cannot be empty';
        }

        // This ensures, casing can be changed
        if (value.trim().toLowerCase() === selectedEnvironment?.name.toLowerCase()) {
          return null;
        }

        const existingEnvironment = allEnvironments.find(
          (env) => env.name.toLowerCase() === value.toLowerCase().trim()
        );
        if (existingEnvironment !== undefined) {
          return 'An environment with this name already exists';
        }

        return null;
      }
    }
  });
  useEffect(() => {
    renameForm.setValues({ name: selectedEnvironment?.name ?? '' });
    renameMutation.reset();
  }, [activeModal]);

  return (
    <Modal
      opened={activeModal === 'rename'}
      onClose={() => {
        setActiveModal(null);
      }}
      title="Rename environment"
    >
      <Text>Choose a new name for "{selectedEnvironment?.name}"</Text>

      <form
        onSubmit={renameForm.onSubmit((values) => {
          renameMutation.mutate({
            collectionId: collection?.uid,
            environmentId: selectedEnvironment?.id,
            name: values.name
          });
        })}
      >
        <TextInput
          {...renameForm.getInputProps('name')}
          key={renameForm.key('name')}
          label={'Name'}
          placeholder={'Updated environment name'}
          my={'md'}
          data-autofocus
        />

        {renameMutation.error ? (
          <Alert title="Rename failed" color="red" icon={<IconAlertCircle style={{ width: rem(18) }} />} mt={'md'}>
            {String(renameMutation.error)}
          </Alert>
        ) : null}

        <Group justify="flex-end" mt={'md'}>
          <Button
            variant="subtle"
            onClick={() => {
              setActiveModal(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="filled" type="submit">
            Rename
          </Button>
        </Group>
      </form>
    </Modal>
  );
};
