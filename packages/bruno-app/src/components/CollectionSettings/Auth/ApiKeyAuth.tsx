import { Select, Stack } from '@mantine/core';
import { ApiKeyAuthSchema, CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import { get } from 'lodash';
import { updateCollectionAuth } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import { useDispatch } from 'react-redux';

const defaultValue: ApiKeyAuthSchema = {
  key: '',
  value: '',
  placement: 'header'
};

type ApiKeyAuthProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
};

export const ApiKeyAuth: React.FC<ApiKeyAuthProps> = ({ item, collection }) => {
  const dispatch = useDispatch();

  const apikeyAuth = get(collection, 'root.request.auth.apikey', defaultValue);

  const handleRun = () => dispatch(sendRequest(item, collection.uid));
  const handleSave = () => dispatch(saveRequest(item.uid, collection.uid));

  const handleAuthChange = (property, value) => {
    dispatch(
      updateCollectionAuth({
        mode: 'apikey',
        collectionUid: collection.uid,
        content: {
          ...apikeyAuth,
          [property]: value
        }
      })
    );
  };

  return (
    <Stack maw={450}>
      <CodeEditor
        value={apikeyAuth.key}
        onSave={handleSave}
        onChange={(val) => handleAuthChange('key', val)}
        onRun={handleRun}
        label="Key"
        singleLine
        asInput
      />

      <CodeEditor
        value={apikeyAuth.value}
        onSave={handleSave}
        onChange={(val) => handleAuthChange('value', val)}
        onRun={handleRun}
        label="Value"
        singleLine
        asInput
      />

      <Select
        label={'Placement'}
        value={apikeyAuth.placement}
        data={[
          { label: 'Header', value: 'header' },
          { label: 'Query parameter', value: 'queryparams' }
        ]}
        onChange={(val) => handleAuthChange('placement', val)}
        allowDeselect={false}
      />
    </Stack>
  );
};
