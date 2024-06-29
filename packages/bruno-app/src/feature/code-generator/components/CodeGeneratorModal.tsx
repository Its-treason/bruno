/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Modal } from '@mantine/core';
import React from 'react';
import { LanguageClientSelector } from './LanguageClientSelector';
import { useLanguageClient } from '../hooks/useLangugeClient';
import { CodeGenerator } from './CodeGenerator';

type CodeGeneratorModalProps = {
  requestUid?: string;
  collectionUid?: string;
  opened: boolean;
  onClose: () => void;
};

export const CodeGeneratorModal: React.FC<CodeGeneratorModalProps> = ({
  collectionUid,
  requestUid,
  opened,
  onClose
}) => {
  const { clientId, setClientId, setTargetId, targetId } = useLanguageClient();

  return (
    <Modal size={'xl'} title={'Generate code'} opened={opened} onClose={onClose}>
      <LanguageClientSelector
        clientId={clientId}
        setClientId={setClientId}
        targetId={targetId}
        setTargetId={setTargetId}
      />

      {requestUid !== undefined && collectionUid !== undefined ? (
        <CodeGenerator clientId={clientId} targetId={targetId} collectionUid={collectionUid} requestUid={requestUid} />
      ) : null}
    </Modal>
  );
};
