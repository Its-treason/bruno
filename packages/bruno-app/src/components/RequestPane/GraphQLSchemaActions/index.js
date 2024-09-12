import { useEffect, useMemo } from 'react';
import useGraphqlSchema from './useGraphqlSchema';
import { IconBook, IconDownload, IconLoader2, IconRefresh } from '@tabler/icons-react';
import get from 'lodash/get';
import { findEnvironmentInCollection } from 'utils/collections';
import { Button, Group, Menu, rem } from '@mantine/core';

const GraphQLSchemaActions = ({ item, collection, onSchemaLoad, toggleDocs }) => {
  const url = item.draft ? get(item, 'draft.request.url', '') : get(item, 'request.url', '');
  const environment = findEnvironmentInCollection(collection, collection.activeEnvironmentUid);
  const request = item.draft ? item.draft.request : item.request;

  let {
    schema,
    schemaSource,
    loadSchema,
    isLoading: isSchemaLoading
  } = useGraphqlSchema(url, environment, request, collection);

  useEffect(() => {
    if (onSchemaLoad) {
      onSchemaLoad(schema);
    }
  }, [schema]);

  const schemaIcon = useMemo(() => {
    if (isSchemaLoading) {
      return <IconLoader2 className="animate-spin" style={{ width: rem(16), height: rem(16) }} />;
    } else if (schema) {
      return <IconRefresh style={{ width: rem(16), height: rem(16) }} />;
    }
    return <IconDownload style={{ width: rem(16), height: rem(16) }} />;
  }, [isSchemaLoading, schema]);

  return (
    <Group>
      <Button
        size="compact-sm"
        leftSection={<IconBook style={{ width: rem(16), height: rem(16) }} />}
        variant="subtle"
        onClick={toggleDocs}
      >
        GraphQL Docs
      </Button>

      <Menu shadow="md" width={220} position="bottom-start">
        <Menu.Target>
          <Button size="compact-sm" leftSection={schemaIcon} variant="subtle">
            Schema
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item onClick={() => loadSchema('introspection')}>
            {schema ? 'Refresh from Introspection' : 'Load from Introspection'}
          </Menu.Item>
          <Menu.Item onClick={() => loadSchema('file')}>Load from File</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};

export default GraphQLSchemaActions;
