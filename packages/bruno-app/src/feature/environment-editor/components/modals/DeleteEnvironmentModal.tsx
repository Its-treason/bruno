/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Alert, Button, Group, Modal, Text, rem } from '@mantine/core';
import { useEnvironmentEditor } from '../../hooks/useEnvironmentEditor';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { deleteEnvironment } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import { IconAlertCircle } from '@tabler/icons-react';

export const DeleteEnvironmentModal: React.FC = () => {
  const { activeModal, setActiveModal, selectedEnvironment, collection } = useEnvironmentEditor();
  const dispatch = useDispatch();

  const deleteMutation = useMutation({
    mutationFn: async (values: { environmentId: string; collectionId: string }) => {
      await dispatch(deleteEnvironment(values.environmentId, values.collectionId));
    },
    onSuccess: () => {
      toast.success('Environment deleted');
      setActiveModal(null);
    }
  });

  return (
    <Modal
      opened={activeModal === 'delete'}
      onClose={() => {
        setActiveModal(null);
      }}
      title="Delete environment"
    >
      <Text>Do you really want to delete "{selectedEnvironment?.name}"?</Text>

      {deleteMutation.error ? (
        <Alert title="Rename failed" color="red" icon={<IconAlertCircle style={{ width: rem(18) }} />} mt={'md'}>
          {String(deleteMutation.error)}
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
        <Button
          variant="filled"
          color="red"
          onClick={() =>
            deleteMutation.mutate({ environmentId: selectedEnvironment!.uid, collectionId: collection.uid })
          }
        >
          Delete
        </Button>
      </Group>
    </Modal>
  );
};
