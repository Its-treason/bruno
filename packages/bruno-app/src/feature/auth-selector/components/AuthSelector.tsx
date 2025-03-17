import { ComboboxData, rem, Select, Stack } from '@mantine/core';
import { requestAuthSchema, RequestAuthSchema } from '@usebruno/schema';
import React, { useCallback, useMemo } from 'react';
import { BasicAuth } from './auth/BasicAuth';
import { ApiKeyAuth } from './auth/ApiKeyAuth';
import { AwsSig4 } from './auth/AwsSig4';
import { BearerToken } from './auth/BearerToken';
import { DigestAuth } from './auth/DigestAuth';
import { OAuth2Selector } from './auth/oAuth2/OAuth2Selector';
import { WsseAuth } from './auth/WsseAuth';
import { NtlmAuth } from './auth/NtlmAuth';

const selectData: ComboboxData = [
  { label: 'No Auth', value: 'none' },
  { label: 'API Key', value: 'apikey' },
  { label: 'AWS Signature V4', value: 'awsv4' },
  { label: 'Basic Auth', value: 'basic' },
  { label: 'Bearer Token', value: 'bearer' },
  { label: 'Digest Auth', value: 'digest' },
  { label: 'NTLM Auth', value: 'ntlm' },
  { label: 'OAuth 2.0', value: 'oauth2' },
  { label: 'WSSE Auth', value: 'wsse' }
];

const selectDataWithInherit = [{ label: 'Inherit', value: 'inherit' }, ...selectData];

type AuthSelectorProps = {
  onChange: (newAuth: RequestAuthSchema) => void;
  auth: RequestAuthSchema;
  collectionUid: string;
  onRun: () => void;
  onSave: () => void;
  showInherit?: boolean;
};

export const AuthSelector: React.FC<AuthSelectorProps> = ({
  auth,
  onChange,
  onRun,
  onSave,
  collectionUid,
  showInherit
}) => {
  const authElement = useMemo(() => {
    const onValueChange = (key: string, value: unknown) => {
      // @ts-expect-error
      onChange({
        mode: auth.mode,
        [auth.mode]: {
          ...auth[auth.mode],
          [key]: value
        }
      });
    };

    switch (auth.mode) {
      case 'none':
        return null;
      case 'apikey':
        return <ApiKeyAuth auth={auth.apikey} onSave={onSave} onValueChange={onValueChange} />;
      case 'awsv4':
        return <AwsSig4 auth={auth.awsv4} onSave={onSave} onValueChange={onValueChange} />;
      case 'basic':
        return <BasicAuth auth={auth.basic} onSave={onSave} onValueChange={onValueChange} />;
      case 'bearer':
        return <BearerToken auth={auth.bearer} onSave={onSave} onValueChange={onValueChange} />;
      case 'digest':
        return <DigestAuth auth={auth.digest} onSave={onSave} onValueChange={onValueChange} />;
      case 'ntlm':
        return <NtlmAuth auth={auth.ntlm} onSave={onSave} onValueChange={onValueChange} />;
      case 'inherit':
        return 'Inherting from Collection';
      case 'oauth2':
        return (
          <OAuth2Selector
            auth={auth.oauth2}
            onSave={onSave}
            onValueChange={onValueChange}
            onChange={onChange}
            collectionUid={collectionUid}
            onRun={onRun}
          />
        );
      case 'wsse':
        return <WsseAuth auth={auth.wsse} onSave={onSave} onValueChange={onValueChange} />;
    }
  }, [auth]);

  const onModeChange = useCallback((mode: string) => {
    // Parsing this here, will create all default values
    onChange(requestAuthSchema.parse({ mode }));
  }, []);

  return (
    <Stack>
      <Select
        size="xs"
        w={rem(170)}
        data={showInherit ? selectDataWithInherit : selectData}
        value={auth.mode}
        allowDeselect={false}
        onChange={onModeChange}
      />
      {authElement}
    </Stack>
  );
};
