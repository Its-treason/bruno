/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React from 'react';
import { useGenerateCode } from '../hooks/useGenerateCode';
import { Alert, Button, CopyButton, rem } from '@mantine/core';
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

  if (generateCodeResult.success === false) {
    return (
      <Alert title="Error" color="red">
        {generateCodeResult.error}
      </Alert>
    );
  }

  return (
    <>
      <CodeEditor value={generateCodeResult.code} mode={targetId} height={'50vh'} readOnly hideMinimap />
      <CopyButton value={generateCodeResult.code} timeout={2000}>
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
    </>
  );
};
