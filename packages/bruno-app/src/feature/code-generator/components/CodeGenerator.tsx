/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React from 'react';
import { useGenerateCode } from '../hooks/useGenerateCode';
import { Alert, Box, Button, CopyButton, Group, Loader, LoadingOverlay, rem } from '@mantine/core';
import CodeEditor from 'components/CodeEditor';
import { useDebouncedValue } from '@mantine/hooks';
import { IconClipboard, IconClipboardCheck, IconClipboardCopy } from '@tabler/icons-react';

type CodeGeneratorProps = {
  collectionUid: string;
  requestUid: string;
  targetId: string;
  clientId: string;
};

export const CodeGenerator: React.FC<CodeGeneratorProps> = ({ clientId, collectionUid, requestUid, targetId }) => {
  // Debounce values here, to prevent flickering if invalid values are in state
  const [debounced] = useDebouncedValue({ clientId, targetId }, 50);
  const generateCodeResult = useGenerateCode(collectionUid, requestUid, debounced.targetId, debounced.clientId);

  if (generateCodeResult.error) {
    return (
      <Alert title="Error" color="red">
        {String(generateCodeResult.error)}
      </Alert>
    );
  }

  return (
    <Box pos="relative">
      <LoadingOverlay visible={generateCodeResult.isLoading} transitionProps={{ transition: 'fade', duration: 0.5 }} />

      <CodeEditor value={generateCodeResult.data ?? ''} mode={targetId} height={'50vh'} readOnly hideMinimap />
      <CopyButton value={generateCodeResult.data ?? ''} timeout={2000}>
        {({ copied, copy }) => (
          <Button
            color={copied ? 'teal' : undefined}
            leftSection={copied ? <IconClipboardCheck size={18} /> : <IconClipboard size={18} />}
            right={0}
            mt={'xs'}
            onClick={copy}
          >
            {copied ? 'Copied code' : 'Copy code'}
          </Button>
        )}
      </CopyButton>
    </Box>
  );
};
