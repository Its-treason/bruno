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
        key={env.id}
        name={env.name}
        active={env.id === selectedEnvironment?.id}
        onClick={() => onEnvironmentSwitch(env.id)}
      />
    ));
  }, [allEnvironments, selectedEnvironment?.id]);

  if (allEnvironments.length === 0) {
    return null;
  }

  return (
    <Stack gap={0} ml={'md'} style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}>
      {items}
    </Stack>
  );
};
