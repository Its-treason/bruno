import { Alert, Anchor } from '@mantine/core';
import { IconCloudDownload } from '@tabler/icons-react';
import { useMemo } from 'react';

export const UpdateInfo: React.FC = () => {
  const [brunoBuildDate, showUpdateInfo] = useMemo(() => {
    const brunoBuildDate = new Date(window.BRUNO_BUILD_TIMESTAMP);
    const showInfo = Date.now() - Number(window.BRUNO_BUILD_TIMESTAMP) > 604800 * 1000;

    return [brunoBuildDate, showInfo] as const;
  }, []);

  if (!showUpdateInfo) {
    return;
  }

  return (
    <Alert variant="light" color="orange" radius="xs" title="Update Available" icon={<IconCloudDownload />} mb={'md'}>
      Your Bruno installation is over a week old (built {brunoBuildDate.toLocaleDateString()}). A newer version with bug
      fixes and features is likely available. Bruno Lazer releases daily nightly builds.{' '}
      <Anchor href="https://github.com/Its-treason/bruno/releases/tag/nightly">Download the latest version</Anchor>.
    </Alert>
  );
};
