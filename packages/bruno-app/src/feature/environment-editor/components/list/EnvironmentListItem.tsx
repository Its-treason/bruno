/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React from 'react';
import { NavLink } from '@mantine/core';

type EnvironmentListItemProps = {
  name: string;
  active: boolean;
  onClick: () => void;
};

export const EnvironmentListItem: React.FC<EnvironmentListItemProps> = ({ name, onClick, active }) => {
  return <NavLink onClick={onClick} active={active} label={name} />;
};
