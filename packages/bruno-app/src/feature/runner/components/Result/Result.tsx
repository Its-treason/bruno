import { CollectionSchema } from '@usebruno/schema';
import { RunnerConfig, RunnerResult } from '../../types/runner';
import { useState } from 'react';
import { Summary } from './Summary';
import classes from './Results.module.scss';
import { RequestList } from './RequestList';
import { RunAgain } from './RunAgain';
import { CancelRunner } from './CancelRunner';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Divider } from '@mantine/core';

type ResultProps = {
  collection: CollectionSchema;
  runnerConfig: RunnerConfig;
  onRun: (config: RunnerConfig) => void;
};

export const Result: React.FC<ResultProps> = ({ collection, runnerConfig, onRun }) => {
  const [resultFocused, setResultFocused] = useState<null | string>(null);

  // @ts-expect-error TODO: Remove this from the collection
  const runnerResults = collection.runnerResult as RunnerResult;

  console.log(runnerResults.info.status);

  return (
    <AutoSizer disableWidth>
      {({ height }) => (
        <div className={classes.container} style={{ height }}>
          <Summary items={runnerResults.items} collection={collection} />
          <Divider />

          <div className={classes.requests}>
            <RequestList collection={collection} items={runnerResults.items} />
          </div>

          <Divider />
          {runnerResults.info.status !== 'ended' ? (
            <CancelRunner cancelToken={runnerResults.info.cancelTokenUid} />
          ) : (
            <RunAgain onRun={onRun} collectionUid={collection.uid} runnerConfig={runnerConfig} />
          )}
        </div>
      )}
    </AutoSizer>
  );
};
