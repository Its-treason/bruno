import { Button, Modal, JsonInput, rem, Text } from '@mantine/core';
import { IconLockCheck, IconLockOpenOff } from '@tabler/icons-react';
import React, { useState } from 'react';

type CertificateEntity = {
  country?: string;
  street?: string;
  locality?: string;
  organization?: string;
  organizationalUnit?: string;
  commonName?: string;
};

type CertificateInfo = {
  subject: CertificateEntity;
  issuer: CertificateEntity;
  validFrom: string;
  validTo: string;
  subjectAltName?: string;
  isCa: boolean;
  fingerprint: string;
  isSelfSigned: boolean;
};

type CipherInfo = {
  name: string;
  version: string;
};

export type RequestSslInfo =
  | {
      authorized: boolean;
      authorizationError?: string;
      encrypted: boolean;
      certificateValid: boolean;
      certificateErrors: string[];
      cipher: CipherInfo;
      certs: CertificateInfo[];
    }
  | false;

type SslInfoModalProps = {
  sslInfo: RequestSslInfo;
};

export const SslInfoModal: React.FC<SslInfoModalProps> = ({ sslInfo }) => {
  const [opened, setOpened] = useState(false);

  if (sslInfo === false) {
    return <Text c={'red'}>No SSL!</Text>;
  }

  return (
    <div>
      <Button
        variant="subtle"
        color={sslInfo.certificateValid ? 'green' : 'red'}
        leftSection={
          sslInfo.certificateValid ? (
            <IconLockCheck style={{ width: rem(18) }} />
          ) : (
            <IconLockOpenOff style={{ width: rem(18) }} />
          )
        }
        onClick={() => setOpened(true)}
      >
        SSL info
      </Button>

      <Modal size={'xl'} opened={opened} onClose={() => setOpened(false)} title={'SSL info'}>
        <JsonInput value={JSON.stringify(sslInfo, null, 2)} readOnly rows={30} />
      </Modal>
    </div>
  );
};
