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
import { addEnvironment } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import { IconAlertCircle } from '@tabler/icons-react';
import { globalEnvironmentStore } from 'src/store/globalEnvironmentStore';
import { useStore } from 'zustand';

export const CreateEnvironmentModal: React.FC = () => {
  const { activeModal, setActiveModal, allEnvironments, collection, onEnvironmentSwitch } = useEnvironmentEditor();
  const createGlobalEnvironment = useStore(globalEnvironmentStore, (state) => state.createEnvironment);
  const dispatch = useDispatch();

  const createMutation = useMutation({
    mutationFn: async (values: { name: string; collectionId?: string }) => {
      if (values.collectionId) {
        await dispatch(addEnvironment(values.name, values.collectionId));
        return;
      }
      const newId = createGlobalEnvironment(values.name);
      // onEnvironmentSwitch(newId, true);
    },
    onSuccess: () => {
      toast.success('Created new environment');
      setActiveModal(null);
    }
  });

  const createForm = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: ''
    },
    validate: {
      name: (value) => {
        if (value.trim().length === 0) {
          return 'Name cannot be empty';
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
    createForm.setValues({ name: '' });
    createMutation.reset();
  }, [activeModal]);

  return (
    <Modal
      opened={activeModal === 'create'}
      onClose={() => {
        setActiveModal(null);
      }}
      title="Create environment"
    >
      <Text>Choose a name for the new environment</Text>

      <form
        onSubmit={createForm.onSubmit((values) => {
          createMutation.mutate({ collectionId: collection?.uid, name: values.name });
        })}
      >
        <TextInput
          {...createForm.getInputProps('name')}
          key={createForm.key('name')}
          label={'Name'}
          placeholder={'New environment name'}
          my={'md'}
          data-autofocus
        />

        {createMutation.error ? (
          <Alert
            variant="light"
            title="Create failed"
            color="red"
            icon={<IconAlertCircle style={{ width: rem(18) }} />}
            mt={'md'}
          >
            {String(createMutation.error)}
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
            Create
          </Button>
        </Group>
      </form>
    </Modal>
  );
};
