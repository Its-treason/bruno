/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useContext } from 'react';
import { SidebarActionContext } from '../provider/SidebarActionContext';

export const useSidebarActions = () => {
  const actions = useContext(SidebarActionContext);
  if (actions === null) {
    throw new Error('useSidebarActions must be used within the SidebarActionProvider');
  }
  return actions;
};
