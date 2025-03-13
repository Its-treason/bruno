import { Button, Group, rem, Stack, Table, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { addQueryParam } from 'providers/ReduxStore/slices/collections';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { QueryParamRow } from './QueryParamRow';
import { saveRequest, sendRequest } from 'providers/ReduxStore/slices/collections/actions';
import { PathParamRow } from './PathParamRow';

type ParamsProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
};

export const Params: React.FC<ParamsProps> = ({ collection, item }) => {
  const dispatch = useDispatch();

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
    <Stack w={'100%'}>
      <Group justify="space-between">
        <Button
          variant="filled"
          size="compact-md"
          leftSection={<IconPlus style={{ width: rem(18) }} />}
          onClick={onAddParam}
        >
          Add parameter
        </Button>
      </Group>

      <Text size="lg">Query parameter</Text>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={'50px'} />
            <Table.Th w={'30%'}>Name</Table.Th>
            <Table.Th w={'auto'}>Value</Table.Th>
            <Table.Th w={'50px'} />
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {queryParams.map((param) => (
            <QueryParamRow
              key={param.uid}
              collectionUid={collection.uid}
              itemUid={item.uid}
              onRun={onRun}
              onSave={onSave}
              param={param}
            />
          ))}
        </Table.Tbody>
      </Table>

      <Text size="lg" mt={'md'}>
        Path parameter
      </Text>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={'33%'}>Name</Table.Th>
            <Table.Th>Value</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {pathParams.map((param) => (
            <PathParamRow
              key={param.uid}
              collectionUid={collection.uid}
              itemUid={item.uid}
              onRun={onRun}
              onSave={onSave}
              param={param}
            />
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
};
