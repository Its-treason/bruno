/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Alert, Button, Group, Modal, Radio, TextInput, Textarea, rem } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { newHttpRequest } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { getRequestFromCurlCommand } from 'utils/curl';
import { BrunoConfigSchema } from '@usebruno/schema';
import { IconAlertCircle } from '@tabler/icons-react';
import { MethodSelector } from 'src/feature/request-url-bar';
import { useEffect } from 'react';

const newRequestFormSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.enum(['http-request', 'graphql-request']),
    name: z.string().min(1).max(255),
    method: z.string().min(1),
    url: z.string()
  }),
  z.object({
    type: z.literal('from-curl'),
    name: z.string().min(1, 'Name is required'),
    curlCommand: z.string().min(1, 'Curl command is required')
  })
]);
type NewFolderFormSchema = z.infer<typeof newRequestFormSchema>;

type NewRequestModalProps = {
  opened: boolean;
  onClose: () => void;
  collectionUid: string;
  brunoConfig: BrunoConfigSchema;
  itemUid?: string;
};

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  opened,
  onClose,
  collectionUid,
  itemUid,
  brunoConfig
}) => {
  const dispatch = useDispatch();

  const newRequestMutation = useMutation({
    mutationFn: async (values: NewFolderFormSchema) => {
      switch (values.type) {
        case 'from-curl':
          const request = getRequestFromCurlCommand(values.curlCommand);
          if (!request) {
            throw new Error('Could not generate request from cURL');
          }
          dispatch(
            newHttpRequest({
              requestName: values.name,
              requestType: 'http-request',
              requestUrl: request.url,
              requestMethod: request.method,
              collectionUid,
              itemUid,
              headers: request.headers,
              body: request.body
            })
          );
          return;
        case 'http-request':
        case 'graphql-request':
          await dispatch(
            newHttpRequest({
              requestName: values.name,
              requestType: values.type,
              requestUrl: values.url,
              requestMethod: values.method,
              collectionUid,
              itemUid
            })
          );
          return;
        default:
          // @ts-expect-error
          throw new Error(`Unknown request type: "${values.type}"`);
      }
    },
    onSuccess: () => {
      toast.success('Request created');
      onClose();
    }
  });

  const newRequestForm = useForm<NewFolderFormSchema>({
    validate: zodResolver(newRequestFormSchema)
  });
  useEffect(() => {
    newRequestForm.setInitialValues({
      name: '',
      method: 'GET',
      type: brunoConfig?.presets?.requestType === 'graphql' ? 'graphql-request' : 'http-request',
      url: brunoConfig?.presets?.requestUrl
    });
    newRequestForm.reset();
  }, [collectionUid]);

  return (
    <Modal
      opened={opened}
      onClose={() => {
        onClose();
        newRequestForm.reset();
        newRequestMutation.reset();
      }}
      title="New request"
      size={'lg'}
    >
      <form
        onSubmit={newRequestForm.onSubmit((values) => {
          newRequestMutation.mutate(values);
        })}
      >
        <TextInput
          {...newRequestForm.getInputProps('name')}
          key={newRequestForm.key('name')}
          label={'Name'}
          placeholder={'New request name'}
          data-autofocus
        />

        <Radio.Group {...newRequestForm.getInputProps('type')} label={'Request type'} mt={'md'}>
          <Group mt={'xs'} mb={'md'}>
            <Radio value={'http-request'} label={'Http'} />
            <Radio value={'graphql-request'} label={'GraphQL'} />
            <Radio value={'from-curl'} label={'From cURL'} />
          </Group>
        </Radio.Group>

        {newRequestForm.values.type === 'from-curl' ? (
          <Textarea
            {...newRequestForm.getInputProps('curlCommand')}
            key={newRequestForm.key('curlCommand')}
            label={'cURL command'}
            placeholder={'Paste cURL command'}
            resize={'vertical'}
            minRows={4}
            maxRows={8}
          />
        ) : (
          <Group gap={'xs'} grow preventGrowOverflow={false}>
            <MethodSelector {...newRequestForm.getInputProps('method')} label={'Method'} withBorder maw={rem(125)} />
            <TextInput
              {...newRequestForm.getInputProps('url')}
              label={'Url'}
              placeholder="https://example.com/hello-world?foo=bar"
            />
          </Group>
        )}

        {newRequestMutation.error ? (
          <Alert title="Rename error" color="red" icon={<IconAlertCircle style={{ width: rem(18) }} />} mt={'md'}>
            {String(newRequestMutation.error)}
          </Alert>
        ) : null}

        <Group justify="flex-end" mt={'md'}>
          <Button
            variant="subtle"
            onClick={() => {
              onClose();
              newRequestForm.reset();
              newRequestMutation.reset();
            }}
            disabled={newRequestMutation.isPending}
          >
            Cancel
          </Button>
          <Button variant="filled" type="submit" loading={newRequestMutation.isPending}>
            Create
          </Button>
        </Group>
      </form>
    </Modal>
  );
};
