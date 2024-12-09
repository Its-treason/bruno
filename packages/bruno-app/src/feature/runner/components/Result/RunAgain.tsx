import { Button, Group } from '@mantine/core';
import { RunnerConfig } from '../../types/runner';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { resetCollectionRunner } from 'providers/ReduxStore/slices/collections';

type RunAgain = {
  runnerConfig: RunnerConfig;
  collectionUid: string;
  onRun: (config: RunnerConfig) => void;
};

export const RunAgain: React.FC<RunAgain> = ({ collectionUid, runnerConfig, onRun }) => {
  const dispatch = useDispatch();
  const reset = useCallback(() => {
    dispatch(
      resetCollectionRunner({
        collectionUid
      })
    );
  }, [collectionUid]);

  return (
    <Group m={'md'}>
      <Button variant="filled" onClick={() => onRun(runnerConfig)}>
        Run again
      </Button>

      {runnerConfig.path !== null ? (
        <Button
          variant="filled"
          onClick={() =>
            onRun({
              ...runnerConfig,
              path: null
            })
          }
        >
          Run collection
        </Button>
      ) : null}

      <Button variant="subtle" onClick={() => reset()}>
        Reset
      </Button>
    </Group>
  );
};
