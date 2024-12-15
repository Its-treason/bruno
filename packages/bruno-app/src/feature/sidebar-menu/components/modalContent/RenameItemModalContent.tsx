/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Alert, Button, Group, Text, TextInput, rem } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { renameItem, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import { IconAlertCircle } from '@tabler/icons-react';
import { RequestItemSchema } from '@usebruno/schema';
import { z } from 'zod';
import { useEffect } from 'react';
import { closeTabs } from 'providers/ReduxStore/slices/tabs';

const renameItemFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255)
});
type RenameItemFormSchema = z.infer<typeof renameItemFormSchema>;

type RenameItemModalContentProps = {
  onClose: () => void;
  collectionUid: string;
  item: RequestItemSchema;
};

export const RenameItemModalContent: React.FC<RenameItemModalContentProps> = ({ onClose, collectionUid, item }) => {
  const dispatch = useDispatch();

  const renameForm = useForm<RenameItemFormSchema>({
    validate: zodResolver(renameItemFormSchema),
    initialValues: {
      name: ''
    }
  });
  useEffect(() => {
    renameForm.setInitialValues({
      name: `${item?.name}`
    });
    renameForm.reset();
  }, [item?.name]);

  const renameMutation = useMutation({
    mutationFn: async (values: RenameItemFormSchema) => {
      if (!item) {
        throw new Error('`item` is not defined, but should have been at this point.');
      }

      // if there is unsaved changes in the request,
      // save them before renaming the request
      if ((item.type === 'http-request' || item.type === 'graphql-request') && item.draft) {
        await dispatch(saveRequest(item.uid, collectionUid, true));
      }
      await dispatch(renameItem(values.name.trim(), item.uid, collectionUid));
      onClose();
    },
    onSuccess: (_, values) => {
      onClose();
      toast.success(`Renamed from "${item?.name}" to "${values.name}"`);

      // Folders lose their Id or something
      if (item.type === 'folder') {
        dispatch(closeTabs({ tabUids: [item.uid] }));
      }

      renameForm.reset();
    }
  });

  return (
    <>
      <Text>Rename "{item?.name}"</Text>

      <form
        onSubmit={renameForm.onSubmit((values) => {
          renameMutation.mutate(values);
        })}
      >
        <TextInput
          {...renameForm.getInputProps('name')}
          key={renameForm.key('name')}
          label={'New name'}
          placeholder={'New request name'}
          my={'md'}
          data-autofocus
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
    </>
  );
};
