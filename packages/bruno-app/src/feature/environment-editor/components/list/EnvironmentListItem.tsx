/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React from 'react';
import { NavLink } from '@mantine/core';
import { EnvironmentSchema } from '@usebruno/schema';

type EnvironmentListItemProps = {
  environment: EnvironmentSchema;
  active: boolean;
  onClick: () => void;
};

export const EnvironmentListItem: React.FC<EnvironmentListItemProps> = ({ environment, onClick, active }) => {
  return <NavLink onClick={onClick} active={active} label={environment.name} />;
};
