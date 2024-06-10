/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Alert, Button, Group, Modal, Text, rem } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { IconAlertCircle } from '@tabler/icons-react';
import { CollectionSchema } from '@usebruno/schema';
import { removeCollection } from 'providers/ReduxStore/slices/collections/actions';

type CloseCollectionModalProps = {
  opened: boolean;
  onClose: () => void;
  collection: CollectionSchema;
};

export const CloseCollectionModal: React.FC<CloseCollectionModalProps> = ({ opened, onClose, collection }) => {
  const dispatch = useDispatch();

  const closeMutation = useMutation({
    mutationFn: async () => {
      await dispatch(removeCollection(collection.uid));
    },
    onSuccess: () => {
      toast.success('Closed collection');
      onClose();
    }
  });

  return (
    <Modal
      opened={opened}
      onClose={() => {
        onClose();
        closeMutation.reset();
      }}
      title="Close collection"
    >
      <Text>Do you want to close "{collection.name}"?</Text>
      <Text>It will still be available in the file system at the above location and can be re-opened later.</Text>

      {closeMutation.error ? (
        <Alert title="Close error" color="red" icon={<IconAlertCircle style={{ width: rem(18) }} />} mt={'md'}>
          {String(closeMutation.error)}
        </Alert>
      ) : null}

      <Group justify="flex-end" mt={'md'}>
        <Button
          variant="subtle"
          onClick={() => {
            onClose();
            closeMutation.reset();
          }}
          disabled={closeMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          variant="filled"
          type="submit"
          color="red"
          loading={closeMutation.isPending}
          onClick={() => {
            closeMutation.mutate();
          }}
        >
          Close
        </Button>
      </Group>
    </Modal>
  );
};
