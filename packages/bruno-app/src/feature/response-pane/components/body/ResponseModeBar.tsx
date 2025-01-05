/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Button, Group } from '@mantine/core';
import { ResponseMode, PrettyMode, PreviewMode } from '../../types/preview';
import { useState } from 'react';
import { ResponseModeSelector } from './ResponseModeSelector';
import { IconExclamationCircle } from '@tabler/icons-react';

const prettyModeOptions: { label: string; value: PrettyMode }[] = [
  { label: 'JSON', value: 'json' },
  { label: 'HTML', value: 'html' },
  { label: 'XML', value: 'xml' },
  { label: 'YAML', value: 'yaml' }
];

const previewModeOptions: { label: string; value: PreviewMode }[] = [
  { label: 'Web', value: 'html' },
  { label: 'PDF', value: 'pdf' },
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: 'Audio', value: 'audio' }
];

type ResponseModeBarProps = {
  mode: ResponseMode;
  setMode: (mode: ResponseMode) => void;
  hasError: boolean;
  hasBody: boolean;
  initialPrettyMode: PrettyMode | null;
  initialPreviewMode: PreviewMode | null;
};

export const ResponseModeBar: React.FC<ResponseModeBarProps> = ({
  mode,
  setMode,
  hasError,
  hasBody,
  initialPrettyMode,
  initialPreviewMode
}) => {
  const [prettyMode, setPrettyMode] = useState<PrettyMode>(initialPrettyMode ?? 'json');
  const [previewMode, setPreviewMode] = useState<PreviewMode>(initialPreviewMode ?? 'html');

  return (
    <Group justify="start" gap={'xs'}>
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

      {hasBody ? (
        <>
          <Button size="xs" variant={mode[0] === 'raw' ? 'light' : 'default'} onClick={() => setMode(['raw', null])}>
            Raw
          </Button>

          <ResponseModeSelector<PrettyMode>
            active={mode[0] === 'pretty'}
            onSelect={(newMode) => {
              setMode(['pretty', newMode]);
              setPrettyMode(newMode);
            }}
            options={prettyModeOptions}
            selected={prettyMode}
          />

          <ResponseModeSelector<PreviewMode>
            active={mode[0] === 'preview'}
            onSelect={(newMode) => {
              setMode(['preview', newMode]);
              setPreviewMode(newMode);
            }}
            options={previewModeOptions}
            selected={previewMode}
          />
        </>
      ) : null}
    </Group>
  );
};
