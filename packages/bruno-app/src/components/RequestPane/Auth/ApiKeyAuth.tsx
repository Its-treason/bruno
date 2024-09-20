import { Select, Stack } from '@mantine/core';
import { ApiKeyAuthSchema, RequestItemSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import { get } from 'lodash';
import { updateAuth } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import { useDispatch } from 'react-redux';

const defaultValue: ApiKeyAuthSchema = {
  key: '',
  value: '',
  placement: 'header'
};

type ApiKeyAuthProps = {
  item: RequestItemSchema;
  collectionUid: string;
};

export const ApiKeyAuth: React.FC<ApiKeyAuthProps> = ({ item, collectionUid }) => {
  const dispatch = useDispatch();

  const apikeyAuth: ApiKeyAuthSchema = item.draft
    ? get(item, 'draft.request.auth.apikey', defaultValue)
    : get(item, 'request.auth.apikey', defaultValue);

  const handleRun = () => dispatch(sendRequest(item, collectionUid));
  const handleSave = () => dispatch(saveRequest(item.uid, collectionUid));

  const handleAuthChange = (property: keyof ApiKeyAuthSchema, value: string) => {
    dispatch(
      updateAuth({
        mode: 'apikey',
        collectionUid,
        itemUid: item.uid,
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
