/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Alert, Button, Group, Modal, Radio, rem } from '@mantine/core';
import { useEnvironmentEditor } from '../../hooks/useEnvironmentEditor';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import importPostmanEnvironment from 'utils/importers/postman-environment';
import { importEnvironment } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import { IconAlertCircle } from '@tabler/icons-react';

export const ImportEnvironmentModal: React.FC = () => {
  const { activeModal, setActiveModal, collection } = useEnvironmentEditor();
  const dispatch = useDispatch();

  const importMutation = useMutation({
    mutationFn: async (values: { type: string; collectionId: string }) => {
      let environment: any;
      switch (values.type) {
        case 'postman':
          environment = await importPostmanEnvironment();
          break;
        default:
          throw new Error(`Unknown environment type: ${values.type}`);
      }

      dispatch(importEnvironment(environment.name, environment.variables, collection.uid));
    },
    onSuccess: () => {
      toast.success('Environment imported');
      setActiveModal(null);
    }
  });

  const importForm = useForm({
    initialValues: {
      type: undefined
    },
    validate: {
      type: (value) => {
        if (!value) {
          return 'Please select the environment type';
        }
        return null;
      }
    }
  });
  useEffect(() => {
    importMutation.reset();
    importForm.reset();
  }, [activeModal]);

  return (
    <Modal
      opened={activeModal === 'import'}
      onClose={() => {
        setActiveModal(null);
      }}
      title="Import environment"
    >
      <form
        onSubmit={importForm.onSubmit((values) => {
          importMutation.mutate({
            collectionId: collection.uid,
            type: values.type
          });
        })}
      >
        <Radio.Group
          name="type"
          label="Select the environment type you want to import"
          withAsterisk
          data-autofocus
          {...importForm.getInputProps('type')}
        >
          <Group my="xs">
            <Radio value="postman" label="Postman" />
          </Group>
        </Radio.Group>

        {importMutation.error ? (
          <Alert title="Import failed" color="red" icon={<IconAlertCircle style={{ width: rem(18) }} />} mt={'md'}>
            {String(importMutation.error)}
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
            Import
          </Button>
        </Group>
      </form>
    </Modal>
  );
};
