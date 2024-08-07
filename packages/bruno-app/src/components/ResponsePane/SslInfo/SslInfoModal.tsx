import React from 'react';
import { RequestSslInfo } from './types';
import { List, Modal, rem, ThemeIcon } from '@mantine/core';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { SslCertInfo } from './SslCertInfo';

type SslInfoModalProps = {
  sslInfo: Exclude<RequestSslInfo, false>;
  opened: boolean;
  onClose: () => void;
};

export const SslInfoModal: React.FC<SslInfoModalProps> = ({ opened, sslInfo, onClose }) => {
  return (
    <Modal size={'xl'} opened={opened} onClose={onClose} title={'SSL info'}>
      <List spacing={'xs'}>
        <List.Item
          icon={
            <ThemeIcon color={sslInfo.authorized ? 'teal' : 'red'} size={24} radius={'xl'}>
              {sslInfo.authorized ? (
                <IconCircleCheck style={{ width: rem(16), height: rem(16) }} />
              ) : (
                <IconCircleX style={{ width: rem(16), height: rem(16) }} />
              )}
            </ThemeIcon>
          }
        >
          {sslInfo.authorized ? 'Certificate valid' : `Certificate invalid: ${sslInfo.authorizationError}`}
        </List.Item>

        <List.Item
          icon={
            <ThemeIcon color={sslInfo.encrypted ? 'teal' : 'red'} size={24} radius={'xl'}>
              {sslInfo.authorized ? (
                <IconCircleCheck style={{ width: rem(16), height: rem(16) }} />
              ) : (
                <IconCircleX style={{ width: rem(16), height: rem(16) }} />
              )}
            </ThemeIcon>
          }
        >
          {sslInfo.encrypted
            ? `Encrypted with Cipher: ${sslInfo.cipher.name} - ${sslInfo.cipher.version}`
            : 'Not encrypted'}
        </List.Item>
      </List>

      {sslInfo.certs.map((cert) => (
        <SslCertInfo key={cert.fingerprint} cert={cert} />
      ))}
    </Modal>
  );
};
