/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Alert, Button, Group, Modal, Text, TextInput, rem } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { cloneItem } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import { IconAlertCircle } from '@tabler/icons-react';
import { RequestItemSchema } from '@usebruno/schema';
import { z } from 'zod';
import { useEffect } from 'react';

const cloneItemCollectionSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255)
});
type CloneCollectionFormSchema = z.infer<typeof cloneItemCollectionSchema>;

type CloneItemModalProps = {
  opened: boolean;
  onClose: () => void;
  collectionUid?: string;
  item?: RequestItemSchema;
};

export const CloneItemModal: React.FC<CloneItemModalProps> = ({ opened, onClose, collectionUid, item }) => {
  const dispatch = useDispatch();

  const cloneForm = useForm<CloneCollectionFormSchema>({
    validate: zodResolver(cloneItemCollectionSchema),
    initialValues: {
      name: ''
    }
  });
  useEffect(() => {
    cloneForm.setInitialValues({
      name: `${item?.name} - Clone`
    });
    cloneForm.reset();
  }, [item?.name]);

  const cloneMutation = useMutation({
    mutationFn: async (values: CloneCollectionFormSchema) => {
      await dispatch(cloneItem(values.name.trim(), item?.uid, collectionUid));
    },
    onSuccess: () => {
      toast.success('Cloned request');
      onClose();
      cloneForm.reset();
    }
  });

  return (
    <Modal
      opened={opened}
      onClose={() => {
        onClose();
        cloneForm.reset();
        cloneMutation.reset();
      }}
      title="Clone collection"
    >
      <Text>Cloning collection "{item?.name}"</Text>

      <form
        onSubmit={cloneForm.onSubmit((values) => {
          cloneMutation.mutate(values);
        })}
      >
        <TextInput
          {...cloneForm.getInputProps('name')}
          key={cloneForm.key('name')}
          label={'Name'}
          placeholder={'Cloned request name'}
          my={'md'}
          data-autofocus
        />

        {cloneMutation.error ? (
          <Alert title="Clone error" color="red" icon={<IconAlertCircle style={{ width: rem(18) }} />} mt={'md'}>
            {String(cloneMutation.error)}
          </Alert>
        ) : null}

        <Group justify="flex-end" mt={'md'}>
          <Button
            variant="subtle"
            onClick={() => {
              onClose();
              cloneForm.reset();
              cloneMutation.reset();
            }}
            disabled={cloneMutation.isPending}
          >
            Cancel
          </Button>
          <Button variant="filled" type="submit" loading={cloneMutation.isPending}>
            Clone
          </Button>
        </Group>
      </form>
    </Modal>
  );
};
