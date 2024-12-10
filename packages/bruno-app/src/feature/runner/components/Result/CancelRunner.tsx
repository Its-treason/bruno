/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Button, Group } from '@mantine/core';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { cancelRunnerExecution } from 'providers/ReduxStore/slices/collections/actions';
import { IconHandStop } from '@tabler/icons-react';

type CancelRunner = {
  cancelToken: string;
};

export const CancelRunner: React.FC<CancelRunner> = ({ cancelToken }) => {
  const dispatch = useDispatch();
  const cancel = useCallback(() => {
    dispatch(cancelRunnerExecution(cancelToken));
  }, [cancelToken]);

  return (
    <Group m={'md'}>
      <Button variant="filled" onClick={cancel} color={'red'} leftSection={<IconHandStop />}>
        Cancel runner
      </Button>
    </Group>
  );
};
