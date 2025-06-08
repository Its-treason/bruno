/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ActionIcon } from '@mantine/core';
import { IconClipboard, IconDownload, IconEraser } from '@tabler/icons-react';
import React, { useCallback } from 'react';
import toast from 'react-hot-toast';
import { responseStore } from 'src/store/responseStore';
import { useStore } from 'zustand';

type ResponseActionsProps = {
  requestId: string;
  itemUid: string;
};

export const ResponseActions: React.FC<ResponseActionsProps> = ({ requestId, itemUid }) => {
  const size = useStore(responseStore, (state) => state.responses.get(requestId)?.size ?? 0);

  const saveResponse = useCallback(
    async (target: 'clipboard' | 'file') => {
      const { headers, timeline } = responseStore.getState().responses.get(requestId);

      const options = timeline.at(0).finalOptions;
      const url = `${options.protocol}//${options.hostname}${options.path}`;

      try {
        window.ipcRenderer.invoke('renderer:save-response', requestId, target, headers, url);
      } catch (error) {
        console.error(`Could not save file to ${target}`, error);
        toast.error(`Could not save file to ${target}`);
        return;
      }

      if (target === 'clipboard') {
        toast.success('Saved to clipboard');
      }
    },
    [requestId]
  );

  const clearResponse = useCallback(() => {
    responseStore.getState().clearResponse(requestId, itemUid);
  }, [requestId]);

  return (
    <>
      <ActionIcon.Group>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={() => saveResponse('file')}
          disabled={size === 0}
          aria-label={'Save response to file'}
          size={'sm'}
        >
          <IconDownload size={17} stroke={1.5} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={() => saveResponse('clipboard')}
          disabled={size === 0}
          aria-label={'Save response to clipboard'}
          size={'sm'}
        >
          <IconClipboard size={17} stroke={1.5} />
        </ActionIcon>
      </ActionIcon.Group>
      <ActionIcon variant="subtle" color="gray" onClick={clearResponse} aria-label={'Clear response'} size={'sm'}>
        <IconEraser size={17} stroke={1.5} />
      </ActionIcon>
    </>
  );
};
