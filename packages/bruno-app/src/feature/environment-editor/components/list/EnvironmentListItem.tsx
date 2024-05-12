/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React from 'react';
import { CollectionEnvironment } from '../../types';
import { NavLink } from '@mantine/core';

type EnvironmentListItemProps = {
  environment: CollectionEnvironment;
  active: boolean;
  onClick: () => void;
};

export const EnvironmentListItem: React.FC<EnvironmentListItemProps> = ({ environment, onClick, active }) => {
  return <NavLink onClick={onClick} active={active} label={environment.name} />;
};
