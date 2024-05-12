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
import { copyEnvironment } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import { IconAlertCircle } from '@tabler/icons-react';

export const CloneEnvironmentModal: React.FC = () => {
  const { activeModal, setActiveModal, selectedEnvironment, allEnvironments, collection } = useEnvironmentEditor();
  const dispatch = useDispatch();

  const cloneEnvironment = useMutation({
    mutationFn: async (values: { name: string; oldEnvId: string; collectionId: string }) => {
      await dispatch(copyEnvironment(values.name, values.oldEnvId, values.collectionId));
    },
    onSuccess: () => {
      toast.success('Cloned environment');
      setActiveModal(null);
    }
  });

  const cloneForm = useForm({
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
    cloneForm.setValues({ name: `${selectedEnvironment?.name} - Copy` });
    cloneEnvironment.reset();
  }, [selectedEnvironment, activeModal]);

  return (
    <Modal
      opened={activeModal === 'clone'}
      onClose={() => {
        setActiveModal(null);
      }}
      title="Clone environment"
    >
      <Text>Choose a name for the clone of "{selectedEnvironment?.name}"</Text>

      <form
        onSubmit={cloneForm.onSubmit((values) => {
          cloneEnvironment.mutate({
            collectionId: collection.uid,
            name: values.name,
            oldEnvId: selectedEnvironment!.uid
          });
        })}
      >
        <TextInput
          {...cloneForm.getInputProps('name')}
          key={cloneForm.key('name')}
          label={'Name'}
          placeholder={'Cloned environment name'}
          my={'md'}
        />

        {cloneEnvironment.error ? (
          <Alert title="Clone error" color="red" icon={<IconAlertCircle style={{ width: rem(18) }} />} mt={'md'}>
            {String(cloneEnvironment.error)}
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
            Clone
          </Button>
        </Group>
      </form>
    </Modal>
  );
};
