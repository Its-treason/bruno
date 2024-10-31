/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Group, Select, Stack, Switch, Tabs, Text } from '@mantine/core';
import { useEffect, useMemo } from 'react';

const options = {
  shell: ['curl', 'httpie', 'wget'],
  powershell: ['restmethod', 'webrequest'],
  c: ['libcurl'],
  clojure: ['clj_http'],
  csharp: ['httpclient', 'restsharp'],
  go: ['native'],
  http: ['http1.1'],
  java: ['asynchttp', 'nethttp', 'okhttp', 'unirest'],
  javascript: ['fetch', 'axios', 'jquery', 'xhr'],
  kotlin: ['okhttp'],
  node: ['fetch', 'native', 'axios', 'request', 'unirest'],
  objc: ['nsurlsession'],
  ocaml: ['cohttp'],
  php: ['curl', 'guzzle', 'http1', 'http2'],
  python: ['requests'],
  r: ['httr'],
  ruby: ['native'],
  swift: ['urlsession']
} as const;

type OptionKeys = keyof typeof options | (typeof options)[keyof typeof options][number];
const labels: Record<OptionKeys, string> = {
  c: 'C',
  libcurl: 'cURL',
  clj_http: 'clj-http',
  httpclient: 'HTTP Client',
  restsharp: 'RestSharp',
  native: 'Native',
  'http1.1': 'HTTP 1.1',
  asynchttp: 'AsyncHttp',
  nethttp: 'NetHttp',
  okhttp: 'OkHttp',
  unirest: 'Unirest',
  fetch: 'fetch',
  axios: 'Axios',
  jquery: 'jQuery',
  xhr: 'XHR',
  request: 'Request',
  nsurlsession: 'NSURLSession',
  cohttp: 'Cohttp',
  php: 'PHP',
  curl: 'cURL',
  guzzle: 'Guzzle',
  http1: 'HttpRequest',
  http2: 'pecl_http',
  restmethod: 'RestMethod',
  webrequest: 'WebRequest',
  requests: 'requests',
  httr: 'httr',
  httpie: 'HTTPie',
  wget: 'Wget',
  urlsession: 'URLSession',
  clojure: 'Clojure',
  csharp: 'C#',
  go: 'Go',
  http: 'HTTP',
  java: 'Java',
  javascript: 'JavaScript',
  kotlin: 'Kotlin',
  node: 'Node.js',
  objc: 'Objective-C',
  ocaml: 'Ocaml',
  powershell: 'PowerShell',
  python: 'Python',
  r: 'R',
  ruby: 'Ruby',
  shell: 'Shell',
  swift: 'Swift'
};

type LanguageClientSelectorProps = {
  targetId: string; // TargetId === Language
  setTargetId: (newTargetId: string) => void;
  clientId: string;
  setClientId: (newClientId: string) => void;
  executeScript: 'true' | 'false';
  setExecuteScript: (newClientId: 'true' | 'false') => void;
};

export const LanguageClientSelector: React.FC<LanguageClientSelectorProps> = ({
  clientId,
  setClientId,
  setTargetId,
  targetId,
  executeScript,
  setExecuteScript
}) => {
  const selectOptions = useMemo(() => {
    return Object.keys(options).map((targetId) => ({
      value: targetId,
      label: labels[targetId] ?? targetId
    }));
  }, []);

  const tabOptions = useMemo(() => {
    const clientIds = options[targetId] ?? [];

    return clientIds.map((clientId) => ({
      value: clientId,
      label: labels[clientId] ?? clientId
    }));
  }, [targetId]);

  useEffect(() => {
    if (clientId === '' && options[targetId]) {
      setClientId(options[targetId][0]);
    }
  }, [clientId]);

  return (
    <Group pb={'md'}>
      <Select
        label="Language"
        clearable={false}
        allowDeselect={false}
        data={selectOptions}
        maxDropdownHeight={400}
        value={targetId}
        onChange={(newValue) => {
          setTargetId(newValue);
        }}
      />

      <Stack gap={0}>
        <Text>Library</Text>
        <Tabs value={clientId} onChange={(newClientId) => setClientId(newClientId)} variant={'pills'}>
          <Tabs.List key={clientId + targetId}>
            {tabOptions.map(({ value, label }) => (
              <Tabs.Tab value={value} key={value}>
                {label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
      </Stack>

      <Switch
        checked={executeScript === 'true'}
        onClick={() => setExecuteScript(executeScript === 'true' ? 'false' : 'true')}
        label="Execute pre-request script"
        mt={'lg'}
      />
    </Group>
  );
};
