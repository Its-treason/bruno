import { useDispatch } from 'react-redux';
import { cancelRequest } from 'providers/ReduxStore/slices/collections/actions';
import { StopWatch } from './StopWatch';
import { Button, Loader, Overlay, Stack } from '@mantine/core';
import { CollectionSchema } from '@usebruno/schema';

type ResponseLoadingOverlayProps = {
  item: any;
  collection: CollectionSchema;
};

export const ResponseLoadingOverlay: React.FC<ResponseLoadingOverlayProps> = ({ item, collection }) => {
  const dispatch = useDispatch();

  const handleCancelRequest = () => {
    dispatch(cancelRequest(item.cancelTokenUid, item, collection));
  };

  return (
    <Overlay backgroundOpacity={0.05} blur={0.5} pt={'xl'}>
      <Stack align="center" mt={'xl'}>
        <StopWatch requestTimestamp={item?.requestSentTimestamp} />
        <Loader />
        <Button mt={'md'} onClick={handleCancelRequest} variant="primary">
          Cancel Request
        </Button>
      </Stack>
    </Overlay>
  );
};
