/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Button, Group, Radio, Stack } from '@mantine/core';
import { CollectionSchema } from '@usebruno/schema';
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

type CloseCollectionModalContentProps = {
  onClose: () => void;
  collection: CollectionSchema;
};

export const ExportCollectionModalContent: React.FC<CloseCollectionModalContentProps> = ({ onClose, collection }) => {
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
  );
};
