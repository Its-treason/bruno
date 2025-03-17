import { Button, ComboboxData, Group, Select, Stack } from '@mantine/core';
import { AwsV4AuthSchema, OAuth2AuthSchema, requestAuthSchema, RequestAuthSchema } from '@usebruno/schema';
import { useCallback, useMemo } from 'react';
import { AuthorizationCode } from './AuthorizationCode';
import { ClientCredentials } from './ClientCredentials';
import { PasswordCredentials } from './PasswordCredentials';
import { clearOauth2Cache } from 'utils/network';
import toast from 'react-hot-toast';

const selectData: ComboboxData = [
  { label: 'Password', value: 'password' },
  { label: 'Authorization Code', value: 'authorization_code' },
  { label: 'Client Credentials', value: 'client_credentials' }
];

type OAuth2SelectorProps = {
  onChange: (newAuth: RequestAuthSchema) => void;
  onValueChange: (key: string, value: unknown) => void;
  auth: OAuth2AuthSchema;
  collectionUid: string;
  onSave: () => void;
  onRun: () => void;
};

export const OAuth2Selector: React.FC<OAuth2SelectorProps> = ({
  auth,
  onChange,
  onSave,
  onValueChange,
  collectionUid,
  onRun
}) => {
  const onGrantTypeChange = useCallback(
    (grantType: string) => {
      onChange(requestAuthSchema.parse({ mode: 'oauth2', oauth2: { ...auth, grantType } }));
    },
    [onChange]
  );

  const oauth2Element = useMemo(() => {
    switch (auth.grantType) {
      case 'authorization_code':
        return <AuthorizationCode auth={auth} onSave={onSave} onValueChange={onValueChange} />;
      case 'client_credentials':
        return <ClientCredentials auth={auth} onSave={onSave} onValueChange={onValueChange} />;
      case 'password':
        return <PasswordCredentials auth={auth} onSave={onSave} onValueChange={onValueChange} />;
    }
  }, [auth]);

  const onCacheClear = useCallback(async () => {
    try {
      await clearOauth2Cache(collectionUid);
      toast.success('cleared cache successfully');
    } catch (error) {
      toast.error(`Cache clear failed! ${error.message}`);
      console.error('Cache clear failed!', error.message);
    }
  }, []);

  return (
    <Stack maw={'350px'}>
      <Select
        label={'Grant type'}
        data={selectData}
        allowDeselect={false}
        value={auth.grantType}
        onChange={onGrantTypeChange}
      />

      {oauth2Element}

      <Group align="end">
        {auth.grantType === 'authorization_code' ? <Button onClick={onCacheClear}>Clear cache</Button> : null}
        <Button onClick={onRun}>Get Access Token</Button>
      </Group>
    </Stack>
  );
};
