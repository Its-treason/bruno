import { Title, Button, Group } from '@mantine/core';
import { IconBook, IconBrandDiscordFilled, IconBrandGithubFilled } from '@tabler/icons-react';

export const ProjectLinks: React.FC = () => {
  const open = (link: string) => {
    window.open(link, '_blank');
  };

  return (
    <>
      <Title order={2} mb={'md'}>
        Project links
      </Title>
      <Group>
        <Button
          leftSection={<IconBrandDiscordFilled />}
          color={'#5865f2'}
          size="md"
          onClick={() => open('https://discord.gg/GTj7QYWPur')}
        >
          Join the Discord
        </Button>
        <Button
          color="black"
          size="md"
          leftSection={<IconBrandGithubFilled />}
          onClick={() => open('https://github.com/its-treason/bruno')}
        >
          GitHub Repository
        </Button>
        <Button
          size="md"
          leftSection={<IconBook />}
          variant={'default'}
          onClick={() => open('https://docs.usebruno.com')}
        >
          Documentation
        </Button>
      </Group>
    </>
  );
};
