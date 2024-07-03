/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Anchor, Blockquote, Button, Container, Group, Space, Stack, Text, Title, rem } from '@mantine/core';
import { IconBook, IconBrandDiscordFilled, IconBrandGithubFilled, IconCopyleft } from '@tabler/icons-react';
import Bruno from 'components/Bruno';
import { CollectionButtons } from './CollectionButtons';

export const Homepage: React.FC = () => {
  return (
    <Container size={'sm'} w={'100%'}>
      <Stack mt={rem(110)} align={'center'}>
        <Group>
          <Bruno width={90} />
          <Title order={1} size={rem(70)}>
            Bruno lazer
          </Title>
        </Group>
        <Text>Opensource IDE for exploring and testing APIs.</Text>
      </Stack>

      <Space h={rem(50)} />

      <CollectionButtons />

      <Space h={rem(50)} />

      <Title order={2} mb={'md'}>
        Project links
      </Title>
      <Group>
        <Button leftSection={<IconBrandDiscordFilled />} color={'#5865f2'} size="md">
          Join the Discord
        </Button>
        <Button color="black" size="md" leftSection={<IconBrandGithubFilled />}>
          GitHub Repository
        </Button>
        <Button size="md" leftSection={<IconBook />} variant={'default'}>
          Documentation
        </Button>
      </Group>

      <Space h={rem(50)} />

      <Blockquote color="blue" icon={<IconCopyleft />} mt="xl" iconSize={36}>
        Parts of Bruno-lazer are licensed under the GNU General Public License version 3 (GPL-3).
        <br />
        You can view the full corresponding source code at:{' '}
        <a target="_blank" href="https://github.com/its-treason/bruno">
          https://github.com/its-treason/bruno
        </a>
        .
      </Blockquote>

      <Text mt={'xs'} ta={'right'}>
        Forked from{' '}
        <Anchor href="https://github.com/usebruno/bruno" target="_blank">
          usebruno/bruno
        </Anchor>
      </Text>
    </Container>
  );
};
