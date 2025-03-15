import { Box, Button, Group, rem, Stack, Switch, Table, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { addQueryParam } from 'providers/ReduxStore/slices/collections';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { QueryParamRow } from './QueryParamRow';
import { saveRequest, sendRequest } from 'providers/ReduxStore/slices/collections/actions';
import { PathParamRow } from './PathParamRow';
import { useToggle } from '@mantine/hooks';
import CodeEditor from 'components/CodeEditor';
import { UrlPreview } from './UrlPreview';
import { QueryParamTable } from './QueryParamTable';
import { PathParamTable } from './PathParamTable';

type ParamsProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
};

export const Params: React.FC<ParamsProps> = ({ collection, item }) => {
  const dispatch = useDispatch();
  const [showPreview, togglePreview] = useToggle();

  const params = item.draft ? item.draft.request.params : item.request.params;
  const queryParams = params.filter((param) => param.type === 'query');
  const pathParams = params.filter((param) => param.type === 'path');

  const onSave = () => dispatch(saveRequest(item.uid, collection.uid));
  const onRun = () => dispatch(sendRequest(item, collection.uid));

  const onAddParam = useCallback(() => {
    dispatch(
      addQueryParam({
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  }, [item.uid, collection.uid, dispatch]);

  return (
    <Stack w={'100%'} gap={'xs'}>
      <Group justify="space-between">
        <Button
          variant="filled"
          size="compact-md"
          leftSection={<IconPlus style={{ width: rem(18) }} />}
          onClick={onAddParam}
        >
          Add parameter
        </Button>

        <Switch label={'URL preview'} onClick={() => togglePreview()} size="md" />
      </Group>

      {showPreview ? (
        <Box mb={'md'}>
          <UrlPreview collectionUid={collection.uid} item={item} />
        </Box>
      ) : null}

      <QueryParamTable
        collectionUid={collection.uid}
        itemUid={item.uid}
        onRun={onRun}
        onSave={onSave}
        queryParams={queryParams}
      />

      <PathParamTable
        collectionUid={collection.uid}
        itemUid={item.uid}
        onRun={onRun}
        onSave={onSave}
        pathParams={pathParams}
      />
    </Stack>
  );
};
