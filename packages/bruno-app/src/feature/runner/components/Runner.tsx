/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Container } from '@mantine/core';
import { CollectionSchema } from '@usebruno/schema';
import React, { useCallback, useState } from 'react';
import { RunnerConfig, RunnerResult } from '../types/runner';
import { RunnerConfigForm } from './RunnerConfigForm';
import { Result } from './Result/Result';
import { useDispatch } from 'react-redux';
import { runCollectionFolder } from 'providers/ReduxStore/slices/collections/actions';
import { useStore } from 'zustand';
import { runnerStore } from 'src/store/runnerStore';

type RunnerProps = {
  collection: CollectionSchema & { runnerResult?: RunnerResult };
};

export const Runner: React.FC<RunnerProps> = ({ collection }) => {
  const dispatch = useDispatch();

  const handleRun = useCallback(
    (config: RunnerConfig) => {
      dispatch(runCollectionFolder(collection.uid, null, true, config.delay));
    },
    [collection.uid]
  );

  const hasRun = useStore(runnerStore, (state) => state.runs.has(collection.uid));
  if (!hasRun) {
    return (
      <Container size={'xs'} mx={'auto'} mt={'xl'}>
        <RunnerConfigForm startRun={handleRun} />
      </Container>
    );
  }

  return <Result collection={collection} onRun={handleRun} />;
};
