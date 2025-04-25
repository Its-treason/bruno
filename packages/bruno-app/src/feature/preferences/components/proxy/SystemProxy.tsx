import { Table } from '@mantine/core';
import { useSelector } from 'react-redux';

export const SystemProxy: React.FC = () => {
  const { http_proxy, https_proxy, no_proxy } = useSelector((state: any) => state.app.systemProxyEnvVariables);

  return (
    <div>
      <Table
        data={{
          head: ['Name', 'Value'],
          body: [
            ['http_proxy', http_proxy || <i>Unset</i>],
            ['https_proxy', https_proxy || <i>Unset</i>],
            ['no_proxy', no_proxy || <i>Unset</i>]
          ],
          caption:
            'Below values are sourced from your system environment variables and cannot be directly updated in Bruno. Please refer to your OS documentation to change these values.'
        }}
      />
    </div>
  );
};
