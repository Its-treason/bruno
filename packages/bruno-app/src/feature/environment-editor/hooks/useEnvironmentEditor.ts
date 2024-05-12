/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useContext } from 'react';
import { EnvironmentProviderProps } from '../types';
import { EnvironmentEditorProvider } from '../provider/EnvironmentEditorProvider';

export const useEnvironmentEditor = (): EnvironmentProviderProps => {
  const values = useContext(EnvironmentEditorProvider);
  if (values === null) {
    throw new Error('No "EnvironmentEditorProvider" context found!');
  }
  return values;
};
