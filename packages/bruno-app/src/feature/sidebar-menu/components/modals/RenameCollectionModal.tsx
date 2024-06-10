/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Alert, Button, Group, Modal, Text, TextInput, rem } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { renameCollection } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import { IconAlertCircle } from '@tabler/icons-react';
import { CollectionSchema } from '@usebruno/schema';
import { z } from 'zod';
import { useEffect } from 'react';

const renameCollectionFormSchema = z.object({
  name: z.string().min(1)
});
type RenameCollectionFormSchema = z.infer<typeof renameCollectionFormSchema>;

type RenameCollectionModalProps = {
  opened: boolean;
  onClose: () => void;
  collection: CollectionSchema;
};

export const RenameCollectionModal: React.FC<RenameCollectionModalProps> = ({ opened, onClose, collection }) => {
  const dispatch = useDispatch();

  const renameMutation = useMutation({
    mutationFn: async (values: RenameCollectionFormSchema) => {
      await dispatch(renameCollection(values.name, collection.pathname));
    },
    onSuccess: () => {
      toast.success('Renamed collection');
      onClose();
    }
  });

  const renameForm = useForm<RenameCollectionFormSchema>({
    validate: zodResolver(renameCollectionFormSchema)
  });
  useEffect(() => {
    renameForm.setInitialValues({
      name: `${collection.name}`
    });
    renameForm.reset();
  }, [collection.name]);

  return (
    <Modal
      opened={opened}
      onClose={() => {
        onClose();
        renameForm.reset();
        renameMutation.reset();
      }}
      title="Rename collection"
    >
      <Text>Rename collection "{collection.name}"</Text>

      <form
        onSubmit={renameForm.onSubmit((values) => {
          renameMutation.mutate(values);
        })}
      >
        <TextInput
          {...renameForm.getInputProps('name')}
          key={renameForm.key('name')}
          label={'Name'}
          placeholder={'New collection name'}
          my={'md'}
        />

        {renameMutation.error ? (
          <Alert title="Rename error" color="red" icon={<IconAlertCircle style={{ width: rem(18) }} />} mt={'md'}>
            {String(renameMutation.error)}
          </Alert>
        ) : null}

        <Group justify="flex-end" mt={'md'}>
          <Button
            variant="subtle"
            onClick={() => {
              onClose();
              renameForm.reset();
              renameMutation.reset();
            }}
            disabled={renameMutation.isPending}
          >
            Cancel
          </Button>
          <Button variant="filled" type="submit" loading={renameMutation.isPending}>
            Rename
          </Button>
        </Group>
      </form>
    </Modal>
  );
};
