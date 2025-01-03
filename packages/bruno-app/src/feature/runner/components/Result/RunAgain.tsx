/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Button, Group } from '@mantine/core';
import { RunnerConfig } from '../../types/runner';
import { useCallback } from 'react';
import { runnerStore } from 'src/store/runnerStore';

type RunAgain = {
  runnerConfig: RunnerConfig;
  collectionUid: string;
  onRun: (config: RunnerConfig) => void;
};

export const RunAgain: React.FC<RunAgain> = ({ collectionUid, runnerConfig, onRun }) => {
  const reset = useCallback(() => {
    runnerStore.getState().resetRun(collectionUid);
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
