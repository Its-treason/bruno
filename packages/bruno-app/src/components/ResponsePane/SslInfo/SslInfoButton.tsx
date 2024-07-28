import React, { useState } from 'react';
import { RequestSslInfo } from './types';
import { IconLockCheck, IconLockOpenOff } from '@tabler/icons-react';
import { Button, rem, Text } from '@mantine/core';
import { SslInfoModal } from './SslInfoModal';

type SslInfoButtonProps = {
  sslInfo: RequestSslInfo;
};

export const SslInfoButton: React.FC<SslInfoButtonProps> = ({ sslInfo }) => {
  const [opened, setOpened] = useState(false);

  if (sslInfo === false) {
    return <Text c={'red'}>No SSL!</Text>;
  }

  return (
    <div>
      <Button
        variant="subtle"
        color={sslInfo.authorized ? 'teal' : 'red'}
        leftSection={
          sslInfo.authorized ? (
            <IconLockCheck style={{ width: rem(18) }} />
          ) : (
            <IconLockOpenOff style={{ width: rem(18) }} />
          )
        }
        onClick={() => setOpened(true)}
      >
        SSL info
      </Button>

      <SslInfoModal onClose={() => setOpened(false)} opened={opened} sslInfo={sslInfo} />
    </div>
  );
};
