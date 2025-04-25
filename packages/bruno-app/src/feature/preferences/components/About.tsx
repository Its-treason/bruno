import { Anchor, List, Stack, Text, Title } from '@mantine/core';
import { IconBrandDiscord, IconBrandGithub, IconSpeakerphone } from '@tabler/icons-react';

export const About: React.FC = () => {
  return (
    <Stack>
      <Title order={3}>Version</Title>
      <Text>
        This build of Lazer is based on commit{' '}
        <Anchor target="_blank" href={`https://github.com/Its-treason/bruno/commit/${window.BRUNO_COMMIT}`}>
          {window.BRUNO_COMMIT}
        </Anchor>{' '}
        and equal to Bruno version {window.BRUNO_VERSION}.
      </Text>

      <Title order={3}>Links</Title>

      <List>
        <List.Item icon={<IconBrandGithub size={18} />}>
          <Anchor target="_blank" href="https://github.com/its-treason/bruno">
            GitHub Repository
          </Anchor>
        </List.Item>

        <List.Item icon={<IconSpeakerphone size={18} />}>
          <Anchor target="_blank" href="https://github.com/its-treason/bruno">
            Report issue
          </Anchor>
        </List.Item>

        <List.Item icon={<IconBrandDiscord size={18} />}>
          <Anchor target="_blank" href="https://discord.gg/GTj7QYWPur">
            Discord Server
          </Anchor>
        </List.Item>
      </List>
    </Stack>
  );
};
