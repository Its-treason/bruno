import { Button, Group, Radio, rem, Text, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { BrunoConfigSchema, brunoConfigSchema, CollectionSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import { cloneDeep } from 'lodash';
import { updateBrunoConfig } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { MethodSelector } from 'src/feature/request-url-bar';

type RequestPrefixProps = {
  collection: CollectionSchema;
};

export const RequestPreset: React.FC<RequestPrefixProps> = ({ collection }) => {
  const dispatch = useDispatch();

  const presetForm = useForm<BrunoConfigSchema['presets']>({
    name: 'request-presets',
    initialValues: { ...collection.brunoConfig.presets },
    validate: zodResolver(brunoConfigSchema.shape.presets)
  });

  return (
    <form
      onSubmit={presetForm.onSubmit((newPresets) => {
        const brunoConfig = cloneDeep(collection.brunoConfig);
        brunoConfig.presets = newPresets;
        dispatch(updateBrunoConfig(brunoConfig, collection.uid));
        toast.success('Collection presets updated');
      })}
    >
      <Text c={'dimmed'}>Presets are used when creating new requests as default values</Text>

      <Radio.Group {...presetForm.getInputProps('requestType')} label={'Request type'} mt={'md'}>
        <Group mt={'xs'} mb={'md'}>
          <Radio value={'http'} label={'Http'} />
          <Radio value={'graphql'} label={'GraphQL'} />
        </Group>
      </Radio.Group>

      <Group gap={'xs'} grow preventGrowOverflow={false} maw={450}>
        <MethodSelector {...presetForm.getInputProps('requestMethod')} label={'Method'} withBorder maw={rem(125)} />
        <CodeEditor
          label={'Url'}
          collection={collection}
          singleLine
          asInput
          {...presetForm.getInputProps('requestUrl')}
        />
      </Group>

      <Button variant="filled" type="submit" leftSection={<IconDeviceFloppy />} mt={'md'}>
        Save
      </Button>
    </form>
  );
};
