/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Alert, Button, Group, Modal, Radio, Stack, Text, rem } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { IconAlertCircle } from '@tabler/icons-react';
import { CollectionSchema } from '@usebruno/schema';
import { removeCollection } from 'providers/ReduxStore/slices/collections/actions';
import exportBrunoCollection from 'utils/collections/export';
import exportPostmanCollection from 'utils/exporters/postman-collection';
import cloneDeep from 'lodash/cloneDeep';
import { transformCollectionToSaveToExportAsFile } from 'utils/collections/index';
import { z } from 'zod';
import { useForm, zodResolver } from '@mantine/form';
import { useCallback } from 'react';

const exportCollectionFormSchema = z.object({
  type: z.enum(['bruno', 'postman'], { message: 'Please select the export format' })
});
type ExportCollectionFormSchema = z.infer<typeof exportCollectionFormSchema>;

type CloseCollectionModalProps = {
  opened: boolean;
  onClose: () => void;
  collection: CollectionSchema;
};

export const ExportCollectionModal: React.FC<CloseCollectionModalProps> = ({ opened, onClose, collection }) => {
  const handleSubmit = useCallback(
    ({ type }: ExportCollectionFormSchema) => {
      const collectionCopy = cloneDeep(collection);
      switch (type) {
        case 'bruno':
          exportBrunoCollection(transformCollectionToSaveToExportAsFile(collectionCopy));
          break;
        case 'postman':
          exportPostmanCollection(collectionCopy);
          break;
      }
      onClose();
    },
    [collection]
  );

  const exportForm = useForm<ExportCollectionFormSchema>({
    validate: zodResolver(exportCollectionFormSchema)
  });

  return (
    <Modal
      opened={opened}
      onClose={() => {
        onClose();
        exportForm.reset();
      }}
      title="Export collection"
    >
      <form onSubmit={exportForm.onSubmit(handleSubmit)}>
        <Radio.Group {...exportForm.getInputProps('type')} label={'Export format'} withAsterisk>
          <Stack my={'xs'} gap={'xs'}>
            <Radio label={'Bruno'} value={'bruno'} />
            <Radio label={'Postman (v2.1)'} value={'postman'} />
          </Stack>
        </Radio.Group>

        <Group justify="flex-end" mt={'md'}>
          <Button
            variant="subtle"
            onClick={() => {
              onClose();
              exportForm.reset();
            }}
          >
            Cancel
          </Button>
          <Button variant="filled" type="submit">
            Export
          </Button>
        </Group>
      </form>
    </Modal>
  );
};
