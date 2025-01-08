/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useDispatch } from 'react-redux';
import { cancelRequest } from 'providers/ReduxStore/slices/collections/actions';
import { StopWatch } from './StopWatch';
import { Button, Loader, Overlay, Stack } from '@mantine/core';
import { useStore } from 'zustand';
import { responseStore } from 'src/store/responseStore';

type ResponseLoadingOverlayProps = {
  requestId: string;
};

export const ResponseLoadingOverlay: React.FC<ResponseLoadingOverlayProps> = ({ requestId }) => {
  const dispatch = useDispatch();

  const handleCancelRequest = () => {
    const state = responseStore.getState();
    const cancelTokenUid = state.responses.get(requestId).cancelTokenUid;
    if (!cancelTokenUid) {
      return;
    }
    dispatch(cancelRequest(cancelTokenUid, requestId));
  };

  const requestSentTimestamp = useStore(responseStore, (state) => state.responses.get(requestId)?.requestSentTimestamp);

  return (
    <Overlay backgroundOpacity={0.1} blur={0.5} pt={'xl'}>
      <Stack align="center" mt={'xl'}>
        <StopWatch requestTimestamp={requestSentTimestamp} />
        <Loader />
        <Button mt={'md'} onClick={handleCancelRequest} variant="primary">
          Cancel Request
        </Button>
      </Stack>
    </Overlay>
  );
};
