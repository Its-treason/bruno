/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Alert, Button, Group, Radio, Stack, Switch, TextInput, Textarea, rem } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { newHttpRequest } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { BrunoConfigSchema } from '@usebruno/schema';
import { IconAlertCircle } from '@tabler/icons-react';
import { MethodSelector } from 'src/feature/request-url-bar';
import { useEffect } from 'react';
import CodeEditor from 'components/CodeEditor';

const newRequestFormSchema = z.discriminatedUnion('curlImport', [
  z.object({
    curlImport: z.literal(false),
    type: z.enum(['http-request', 'graphql-request']),
    name: z.string().trim().min(1, 'Name is required').max(255),
    method: z.string().min(1),
    url: z.string()
  }),
  z.object({
    curlImport: z.literal(true),
    name: z.string().trim().min(1, 'Name is required').max(255),
    type: z.enum(['http-request', 'graphql-request']),
    curlCommand: z.string().min(1, 'Curl command is required')
  })
]);
type NewFolderFormSchema = z.infer<typeof newRequestFormSchema>;

type NewRequestModalContentProps = {
  onClose: () => void;
  collectionUid: string;
  brunoConfig: BrunoConfigSchema;
  itemUid?: string;
};

export const NewRequestModalContent: React.FC<NewRequestModalContentProps> = ({
  onClose,
  collectionUid,
  itemUid,
  brunoConfig
}) => {
  const dispatch = useDispatch();

  const newRequestMutation = useMutation({
    mutationFn: async (values: NewFolderFormSchema) => {
      if (values.curlImport) {
        const request = await window.ipcRenderer.invoke('renderer:curl-to-request', values.curlCommand);
        if (!request) {
          throw new Error('Could not generate request from cURL');
        }

        // Graphql will be parsed as json by default. So it must be converted here.
        // TODO: this should be handled in renderer:curl-to-request
        if (values.type === 'graphql-request' && request.body.mode === 'json') {
          const graphql = JSON.parse(request.body.json);
          if (typeof graphql.variables !== 'string') {
            graphql.variables = JSON.stringify(graphql.variables);
          }

          request.body = {
            mode: 'graphql',
            graphql
          };
        }

        dispatch(
          newHttpRequest({
            requestName: values.name.trim(),
            requestType: values.type,
            requestUrl: request.url,
            requestMethod: request.method,
            collectionUid,
            itemUid,
            headers: request.headers,
            body: request.body
          })
        );
        return;
      } else if (values.curlImport === false) {
        await dispatch(
          newHttpRequest({
            requestName: values.name.trim(),
            requestType: values.type,
            requestUrl: values.url,
            requestMethod: values.method,
            collectionUid,
            itemUid
          })
        );
      }
    },
    onSuccess: () => {
      toast.success('Request created');
      onClose();
    }
  });

  const newRequestForm = useForm<NewFolderFormSchema>({
    validate: zodResolver(newRequestFormSchema),
    initialValues: {
      curlImport: false,
      name: '',
      method: 'GET',
      type: brunoConfig?.presets?.requestType === 'graphql' ? 'graphql-request' : 'http-request',
      url: brunoConfig?.presets?.requestUrl ?? ''
    }
  });
  useEffect(() => {
    newRequestForm.setInitialValues({
      curlImport: false,
      name: '',
      method: brunoConfig?.presets?.requestMethod ?? 'GET',
      type: brunoConfig?.presets?.requestType === 'graphql' ? 'graphql-request' : 'http-request',
      url: brunoConfig?.presets?.requestUrl ?? ''
    });
    newRequestForm.reset();
  }, [collectionUid]);

  return (
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

      <Switch
        label="Import curl command"
        {...newRequestForm.getInputProps('curlImport')}
        mt={'md'}
        defaultChecked={false}
      />

      <Radio.Group {...newRequestForm.getInputProps('type')} label={'Request type'} mt={'md'}>
        <Group mt={'xs'} mb={'md'}>
          <Radio value={'http-request'} label={'Http'} />
          <Radio value={'graphql-request'} label={'GraphQL'} />
        </Group>
      </Radio.Group>

      {newRequestForm.values.curlImport ? (
        <Textarea
          {...newRequestForm.getInputProps('curlCommand')}
          key={newRequestForm.key('curlCommand')}
          label={'cURL command'}
          placeholder={'Paste cURL command'}
          resize={'vertical'}
          minRows={4}
          maxRows={8}
          onPaste={(evt) => {
            const pastedUrl = evt.currentTarget.value.toLowerCase();
            if (pastedUrl.includes('/graphql') || pastedUrl.includes('application/graphql')) {
              newRequestForm.setFieldValue('requestType', 'graphql-request');
            }
          }}
        />
      ) : (
        <Group gap={'xs'} grow preventGrowOverflow={false}>
          <MethodSelector {...newRequestForm.getInputProps('method')} label={'Method'} withBorder maw={rem(110)} />
          <CodeEditor label="Url" singleLine asInput withVariables {...newRequestForm.getInputProps('url')} />
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
  );
};
