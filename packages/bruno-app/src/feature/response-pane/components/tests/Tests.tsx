/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React from 'react';
import { TestResults } from './TestResults';
import { Text } from '@mantine/core';
import { AssertionResults } from './AssertionResults';
import classes from './Tests.module.scss';

type TestsProps = {
  requestId: string;
};

export const Tests: React.FC<TestsProps> = ({ requestId }) => {
  return (
    <>
      <Text size="lg" className={classes.title}>
        Tests
      </Text>
      <TestResults itemUid={requestId} />
      <Text size="lg" mt={'xl'} className={classes.title}>
        Assertions
      </Text>
      <AssertionResults itemUid={requestId} />
    </>
  );
};
