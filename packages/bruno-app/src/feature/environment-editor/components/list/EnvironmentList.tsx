/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React, { useMemo } from 'react';
import { useEnvironmentEditor } from '../../hooks/useEnvironmentEditor';
import { EnvironmentListItem } from './EnvironmentListItem';
import { Stack } from '@mantine/core';

export const EnvironmentList: React.FC = () => {
  const { allEnvironments, selectedEnvironment, onEnvironmentSwitch } = useEnvironmentEditor();

  const items = useMemo(() => {
    return allEnvironments.map((env) => (
      <EnvironmentListItem
        key={env.uid}
        environment={env}
        active={env.uid === selectedEnvironment?.uid}
        onClick={() => onEnvironmentSwitch(env.uid)}
      />
    ));
  }, [allEnvironments, selectedEnvironment?.uid]);

  if (allEnvironments.length === 0) {
    return null;
  }

  return (
    <Stack gap={0} ml={'md'} style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}>
      {items}
    </Stack>
  );
};
