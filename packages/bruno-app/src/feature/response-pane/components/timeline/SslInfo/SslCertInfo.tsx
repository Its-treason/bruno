/*
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React from 'react';
import { CertificateInfo } from './types';
import { Stack, Table, Text } from '@mantine/core';

type SslCertInfo = {
  cert: CertificateInfo;
};

export const SslCertInfo: React.FC<SslCertInfo> = ({ cert }) => {
  return (
    <Stack gap={'xs'} mt={'md'} style={{ overflowWrap: 'anywhere' }}>
      <Text size={'xl'} fw={700}>
        {cert.subject.commonName}
      </Text>

      <Text size={'lg'}>Subject</Text>
      <Table
        layout="fixed"
        data={{
          body: [
            ['Country', cert.subject.country || 'N/A'],
            ['State/Province/County', cert.subject.street || 'N/A'],
            ['Locality', cert.subject.locality || 'N/A'],
            ['Organisation', cert.subject.organization || 'N/A'],
            ['Organisation Unit', cert.subject.organizationalUnit || 'N/A'],
            ['Common Name', cert.subject.commonName || 'N/A']
          ]
        }}
      />

      <Text size={'lg'}>Issuer</Text>
      <Table
        layout="fixed"
        data={{
          body: [
            ['Country', cert.issuer.country || 'N/A'],
            ['State/Province/County', cert.issuer.street || 'N/A'],
            ['Locality', cert.issuer.locality || 'N/A'],
            ['Organisation', cert.issuer.organization || 'N/A'],
            ['Organisation Unit', cert.issuer.organizationalUnit || 'N/A'],
            ['Common Name', cert.issuer.commonName || 'N/A']
          ]
        }}
      />

      <Text size={'lg'}>Validity</Text>
      <Table
        layout="fixed"
        data={{
          body: [
            ['From', cert.validFrom],
            ['To', cert.validTo]
          ]
        }}
      />

      <Text size={'lg'}>Other</Text>
      <Table
        layout="fixed"
        data={{
          body: [
            ['Subject Alt Names', cert.subjectAltName],
            ['Fingerprint', cert.fingerprint],
            ['CA Certificate?', cert.isCa ? 'Yes' : 'No'],
            ['Self signed?', cert.isSelfSigned ? 'Yes' : 'No']
          ]
        }}
      />
    </Stack>
  );
};
