import { Divider, Group, rem, Space, Stack, Text, Title } from '@mantine/core';
import { CollectionSchema } from '@usebruno/schema';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { flattenItems } from 'utils/collections';

export const CollectionStats: React.FC = () => {
  const collections = useSelector((state: any) => state.collections.collections as CollectionSchema[]);

  const { requestCount, collectionCount, environmentCount } = useMemo(() => {
    console.log(collections);
    const requestCount = collections.reduce((acc, collection) => {
      return acc + flattenItems(collection.items).length;
    }, 0);
    const environmentCount = collections.reduce((acc, collection) => {
      return acc + collection.environments.length;
    }, 0);
    const collectionsCount = collections.length;

    const formatter = new Intl.NumberFormat();
    return {
      requestCount: formatter.format(requestCount),
      collectionCount: formatter.format(collectionsCount),
      environmentCount: formatter.format(environmentCount)
    } as const;
  }, [collections]);

  if (collections.length === 0) {
    return null;
  }

  return (
    <>
      <Space h={rem(50)} />

      <Title order={2} mb={'md'}>
        Currently opened
      </Title>

      <Group justify="space-around">
        <Stack gap={0}>
          <Text size="xl" fw={700}>
            {requestCount}
          </Text>
          <Text size="md">Requests</Text>
        </Stack>
        <Divider orientation="vertical" />
        <Stack gap={0}>
          <Text size="xl" fw={700}>
            {environmentCount}
          </Text>
          <Text size="md">Environments</Text>
        </Stack>
        <Divider orientation="vertical" />
        <Stack gap={0}>
          <Text size="xl" fw={700}>
            {collectionCount}
          </Text>
          <Text size="md">Collections</Text>
        </Stack>
      </Group>
    </>
  );
};
