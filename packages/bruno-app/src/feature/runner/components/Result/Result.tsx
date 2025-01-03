/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { CollectionSchema } from '@usebruno/schema';
import { RunnerConfig } from '../../types/runner';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Summary } from './Summary';
import classes from './Results.module.scss';
import { RequestList } from './RequestList';
import { RunAgain } from './RunAgain';
import { CancelRunner } from './CancelRunner';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Divider } from '@mantine/core';
import { ResultDetails } from './ResultDetails';
import { useStore } from 'zustand';
import { runnerStore } from 'src/store/runnerStore';

type ResultProps = {
  collection: CollectionSchema;
  onRun: (config: RunnerConfig) => void;
};

export const Result: React.FC<ResultProps> = ({ collection, onRun }) => {
  const [resultFocused, setResultFocused] = useState<null | string>(null);

  const runnerResults = useStore(runnerStore, (state) => state.runs.get(collection.uid));

  const listRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!listRef.current) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    // Only scroll if the user is already near the bottom
    if (distanceFromBottom < 200) {
      listRef.current.scrollTo({ top: 999999999, behavior: 'smooth' });
    }
  }, [runnerResults.items.length]);

  const onFocus = useCallback((uid: string) => {
    setResultFocused((current) => {
      if (uid === current) {
        return null;
      }
      return uid;
    });
  }, []);

  return (
    <AutoSizer disableWidth>
      {({ height }) => (
        <div className={classes.container} style={{ height }} data-result-focused={resultFocused !== null}>
          <Summary itemUids={runnerResults.items} collection={collection} />
          <Divider />

          <div className={classes.requests} ref={listRef}>
            <RequestList collection={collection} items={runnerResults.items} onFocus={onFocus} />
          </div>

          <Divider />
          {runnerResults.status !== 'ended' ? (
            <CancelRunner cancelToken={runnerResults.cancelTokenUid} />
          ) : (
            <RunAgain onRun={onRun} collectionUid={collection.uid} runnerConfig={runnerResults.runnerConfig} />
          )}

          {resultFocused ? <ResultDetails itemUid={resultFocused} collection={collection} /> : null}
        </div>
      )}
    </AutoSizer>
  );
};
