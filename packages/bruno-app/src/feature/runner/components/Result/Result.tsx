import { CollectionSchema } from '@usebruno/schema';
import { RunnerConfig, RunnerResult, RunnerResultItem } from '../../types/runner';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Summary } from './Summary';
import classes from './Results.module.scss';
import { RequestList } from './RequestList';
import { RunAgain } from './RunAgain';
import { CancelRunner } from './CancelRunner';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Divider } from '@mantine/core';
import { ResultDetails } from './ResultDetails';
import { useEditor } from '@tiptap/react';

type ResultProps = {
  collection: CollectionSchema;
  runnerConfig: RunnerConfig;
  onRun: (config: RunnerConfig) => void;
};

export const Result: React.FC<ResultProps> = ({ collection, runnerConfig, onRun }) => {
  const [resultFocused, setResultFocused] = useState<null | RunnerResultItem>(null);

  // @ts-expect-error TODO: Remove this from the collection
  const runnerResults = collection.runnerResult as RunnerResult;

  const listRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!listRef.current) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    // Only scroll if the user is already near the bottom
    if (distanceFromBottom < 200) {
      console.log('must scroll', distanceFromBottom);
      listRef.current.scrollTo({ top: 999999999, behavior: 'smooth' });
    }
  }, [runnerResults.items.length]);

  return (
    <AutoSizer disableWidth>
      {({ height }) => (
        <div className={classes.container} style={{ height }} data-result-focused={resultFocused !== null}>
          <Summary items={runnerResults.items} collection={collection} />
          <Divider />

          <div className={classes.requests} ref={listRef}>
            <RequestList
              collection={collection}
              items={runnerResults.items}
              onFocus={(item) => setResultFocused(item)}
            />
          </div>

          <Divider />
          {runnerResults.info.status !== 'ended' ? (
            <CancelRunner cancelToken={runnerResults.info.cancelTokenUid} />
          ) : (
            <RunAgain onRun={onRun} collectionUid={collection.uid} runnerConfig={runnerConfig} />
          )}

          {resultFocused ? <ResultDetails item={resultFocused} collection={collection} /> : null}
        </div>
      )}
    </AutoSizer>
  );
};
