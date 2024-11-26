/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Button, Group } from '@mantine/core';
import { ResponseMode, PrettyMode, PreviewMode } from '../types/preview';
import { useState } from 'react';
import { ResponseModeSelector } from './ResponseModeSelector';
import { IconExclamationCircle } from '@tabler/icons-react';

const prettyModeOptions: { label: string; value: PrettyMode }[] = [
  { label: 'HTML', value: 'html' },
  { label: 'JSON', value: 'json' },
  { label: 'XML', value: 'xml' },
  { label: 'YAML', value: 'yaml' }
];

const previewModeOptions: { label: string; value: PreviewMode }[] = [
  { label: 'Audio', value: 'audio' },
  { label: 'Web', value: 'html' },
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' }
];

type ResponseModeBarProps = {
  mode: ResponseMode;
  setMode: (mode: ResponseMode) => void;
  hasError: boolean;
};

export const ResponseModeBar: React.FC<ResponseModeBarProps> = ({ mode, setMode, hasError }) => {
  const [prettyMode, setPrettyMode] = useState<PrettyMode>('json');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('html');

  return (
    <Group justify="start" gap={'xs'}>
      <ResponseModeSelector<PreviewMode>
        active={mode[0] === 'preview'}
        onSelect={(newMode) => {
          setMode(['preview', newMode]);
          setPreviewMode(newMode);
        }}
        options={previewModeOptions}
        selected={previewMode}
      />

      <ResponseModeSelector<PrettyMode>
        active={mode[0] === 'pretty'}
        onSelect={(newMode) => {
          setMode(['pretty', newMode]);
          setPrettyMode(newMode);
        }}
        options={prettyModeOptions}
        selected={prettyMode}
      />

      <Button size="xs" variant={mode[0] === 'raw' ? 'light' : 'default'} onClick={() => setMode(['raw', null])}>
        Raw
      </Button>

      {hasError ? (
        <Button
          size="xs"
          variant={mode[0] === 'error' ? 'light' : 'default'}
          onClick={() => setMode(['error', null])}
          color="red"
          leftSection={<IconExclamationCircle />}
        >
          Error
        </Button>
      ) : null}
    </Group>
  );
};
