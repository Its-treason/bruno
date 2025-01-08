/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ActionIcon } from '@mantine/core';
import { IconDownload, IconEraser } from '@tabler/icons-react';
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

  const saveResponseToFile = useCallback(() => {
    const { headers, timeline } = responseStore.getState().responses.get(requestId);

    const options = timeline.at(0).finalOptions;
    const url = `${options.protocol}//${options.hostname}${options.path}`;

    return new Promise((resolve, reject) => {
      window.ipcRenderer
        .invoke('renderer:save-response-to-file', requestId, headers, url)
        .then(resolve)
        .catch((err) => {
          toast.error(err.message || 'Something went wrong!');
          reject(err);
        });
    });
  }, [requestId]);

  const clearResponse = useCallback(() => {
    responseStore.getState().clearResponse(requestId, itemUid);
  }, [requestId]);

  return (
    <>
      <ActionIcon
        variant="subtle"
        color="gray"
        onClick={saveResponseToFile}
        disabled={size === 0}
        aria-label={'Save response to file'}
        size={'sm'}
      >
        <IconDownload size={17} stroke={1.5} />
      </ActionIcon>
      <ActionIcon variant="subtle" color="gray" onClick={clearResponse} aria-label={'Clear response'} size={'sm'}>
        <IconEraser size={17} stroke={1.5} />
      </ActionIcon>
    </>
  );
};
