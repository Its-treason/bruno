/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Alert, Button, Group, Modal, Text, TextInput, Tooltip, rem } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { cloneCollection } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import { IconAlertCircle, IconHelp } from '@tabler/icons-react';
import { DirectoryPicker } from 'components/inputs/DirectoryPicker';
import { CollectionSchema } from '@usebruno/schema';
import { z } from 'zod';
import { useEffect } from 'react';

const cloneCollectionFormSchema = z.object({
  name: z.string().min(1),
  folder: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[\w\-. ]+$/),
  location: z.string().min(1)
});
type CloneCollectionFormSchema = z.infer<typeof cloneCollectionFormSchema>;

type CloneCollectionModalProps = {
  opened: boolean;
  onClose: () => void;
  collectionName: string;
  collectionPath: string;
};

export const CloneCollectionModal: React.FC<CloneCollectionModalProps> = ({
  opened,
  onClose,
  collectionName,
  collectionPath
}) => {
  const dispatch = useDispatch();

  const cloneMutation = useMutation({
    mutationFn: async (values: CloneCollectionFormSchema) => {
      await dispatch(cloneCollection(values.name, values.folder, values.location, collectionPath));
    },
    onSuccess: () => {
      toast.success('Cloned collection');
      onClose();
    }
  });

  const cloneForm = useForm<CloneCollectionFormSchema>({
    validate: zodResolver(cloneCollectionFormSchema)
  });
  useEffect(() => {
    cloneForm.setInitialValues({
      name: `${collectionName} - Clone`,
      location: '',
      folder: `${collectionName} - Clone`
    });
    cloneForm.reset();
  }, [collectionName]);

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
      <Text>Cloning collection "{collectionName}"</Text>

      <form
        onSubmit={cloneForm.onSubmit((values) => {
          cloneMutation.mutate(values);
        })}
      >
        <TextInput
          {...cloneForm.getInputProps('name')}
          key={cloneForm.key('name')}
          label={'Name'}
          placeholder={'Cloned collection name'}
          my={'md'}
          data-autofocus
        />

        <DirectoryPicker
          {...cloneForm.getInputProps('location')}
          key={cloneForm.key('location')}
          label={'Location'}
          placeholder={'Path to collection'}
          my={'md'}
        />

        <TextInput
          {...cloneForm.getInputProps('folder')}
          key={cloneForm.key('folder')}
          label={
            <>
              Folder name
              <Tooltip label={'This folder will be created in the selected location'}>
                <IconHelp style={{ width: rem(18), display: 'inline', marginLeft: rem(4) }} />
              </Tooltip>
            </>
          }
          placeholder={'Folder name'}
          my={'md'}
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
