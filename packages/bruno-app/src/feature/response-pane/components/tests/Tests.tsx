/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React from 'react';
import { TestResults } from './TestResults';
import { Stack, Text } from '@mantine/core';
import { AssertionResults } from './AssertionResults';
import classes from './Tests.module.scss';

type TestsProps = {
  itemUid: string;
};

export const Tests: React.FC<TestsProps> = ({ itemUid }) => {
  return (
    <>
      <Text size="lg" className={classes.title}>
        Tests
      </Text>
      <TestResults itemUid={itemUid} />
      <Text size="lg" mt={'xl'} className={classes.title}>
        Assertions
      </Text>
      <AssertionResults itemUid={itemUid} />
    </>
  );
};
