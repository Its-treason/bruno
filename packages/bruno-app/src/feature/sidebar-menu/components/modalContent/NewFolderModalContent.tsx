/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Alert, Button, Group, TextInput, rem } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { newFolder } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import { IconAlertCircle } from '@tabler/icons-react';
import { z } from 'zod';

const newFolderFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255)
});
type NewFolderFormSchema = z.infer<typeof newFolderFormSchema>;

type NewFolderModalContentProps = {
  onClose: () => void;
  collectionUid: string;
  itemUid: string;
};

export const NewFolderModalContent: React.FC<NewFolderModalContentProps> = ({ onClose, collectionUid, itemUid }) => {
  const dispatch = useDispatch();

  const newFolderForm = useForm<NewFolderFormSchema>({
    validate: zodResolver(newFolderFormSchema),
    initialValues: {
      name: ''
    }
  });

  const newFolderMutation = useMutation({
    mutationFn: async (values: NewFolderFormSchema) => {
      await dispatch(newFolder(values.name.trim(), collectionUid, itemUid));
    },
    onSuccess: () => {
      toast.success('Folder created');
      newFolderForm.reset();
      onClose();
    }
  });

  return (
    <form
      onSubmit={newFolderForm.onSubmit((values) => {
        newFolderMutation.mutate(values);
      })}
    >
      <TextInput
        {...newFolderForm.getInputProps('name')}
        key={newFolderForm.key('name')}
        label={'Name'}
        placeholder={'New folder name'}
        my={'md'}
        data-autofocus
      />

      {newFolderMutation.error ? (
        <Alert title="Folder create error" color="red" icon={<IconAlertCircle style={{ width: rem(18) }} />} mt={'md'}>
          {String(newFolderMutation.error)}
        </Alert>
      ) : null}

      <Group justify="flex-end" mt={'md'}>
        <Button
          variant="subtle"
          onClick={() => {
            onClose();
            newFolderForm.reset();
            newFolderMutation.reset();
          }}
          disabled={newFolderMutation.isPending}
        >
          Cancel
        </Button>
        <Button variant="filled" type="submit" loading={newFolderMutation.isPending}>
          Create
        </Button>
      </Group>
    </form>
  );
};
