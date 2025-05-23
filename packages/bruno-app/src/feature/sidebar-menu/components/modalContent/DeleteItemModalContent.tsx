/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Alert, Button, Group, Text, rem } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { IconAlertCircle } from '@tabler/icons-react';
import { RequestItemSchema } from '@usebruno/schema';
import { deleteItem } from 'providers/ReduxStore/slices/collections/actions';
import { closeTabs } from 'providers/ReduxStore/slices/tabs';
import { recursivelyGetAllItemUids } from 'utils/collections';

type DeleteItemModalProps = {
  onClose: () => void;
  collectionUid: string;
  item: RequestItemSchema;
};

export const DeleteItemModalContent: React.FC<DeleteItemModalProps> = ({ onClose, collectionUid, item }) => {
  const dispatch = useDispatch();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!item) {
        throw new Error('`item` is not defined, but should have been at this point.');
      }

      await dispatch(deleteItem(item.uid, collectionUid));

      const tabUids = item.type === 'folder' ? [...recursivelyGetAllItemUids(item.items), item.uid] : [item.uid];
      dispatch(
        closeTabs({
          tabUids
        })
      );
    },
    onSuccess: () => {
      toast.success(`Deleted ${item?.type === 'folder' ? 'folder' : 'request'}`);
      onClose();
    }
  });

  return (
    <>
      <Text>Do you really want to delete "{item?.name}"?</Text>

      {deleteMutation.error ? (
        <Alert title="Close error" color="red" icon={<IconAlertCircle style={{ width: rem(18) }} />} mt={'md'}>
          {String(deleteMutation.error)}
        </Alert>
      ) : null}

      <Group justify="flex-end" mt={'md'}>
        <Button
          variant="subtle"
          onClick={() => {
            onClose();
            deleteMutation.reset();
          }}
          disabled={deleteMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          variant="filled"
          type="submit"
          color="red"
          loading={deleteMutation.isPending}
          onClick={() => {
            deleteMutation.mutate();
          }}
        >
          Delete
        </Button>
      </Group>
    </>
  );
};
