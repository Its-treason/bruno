/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Alert, Button, Group, Text, TextInput, Tooltip, rem } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { cloneCollection } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import { IconAlertCircle, IconHelp } from '@tabler/icons-react';
import { z } from 'zod';
import { useEffect } from 'react';
import { fileNameSchema } from '@usebruno/schema';
import { FilePicker } from 'components/inputs/FilePicker';

const cloneCollectionFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  folder: fileNameSchema,
  location: z.string().trim().min(1, 'Location is required')
});
type CloneCollectionFormSchema = z.infer<typeof cloneCollectionFormSchema>;

type CloneCollectionModalContentProps = {
  onClose: () => void;
  collectionName: string;
  collectionPath: string;
};

export const CloneCollectionModalContent: React.FC<CloneCollectionModalContentProps> = ({
  onClose,
  collectionName,
  collectionPath
}) => {
  const dispatch = useDispatch();

  const cloneMutation = useMutation({
    mutationFn: async (values: CloneCollectionFormSchema) => {
      await dispatch(cloneCollection(values.name.trim(), values.folder, values.location.trim(), collectionPath));
    },
    onSuccess: () => {
      toast.success('Cloned collection');
      onClose();
    }
  });

  const cloneForm = useForm<CloneCollectionFormSchema>({
    validate: zodResolver(cloneCollectionFormSchema),
    initialValues: {
      name: '',
      location: '',
      folder: ''
    }
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

      <FilePicker
        {...cloneForm.getInputProps('location')}
        key={cloneForm.key('location')}
        label={'Location'}
        placeholder={'Path to collection'}
        my={'md'}
        filters={[]}
        properties={['openDirectory']}
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
  );
};
