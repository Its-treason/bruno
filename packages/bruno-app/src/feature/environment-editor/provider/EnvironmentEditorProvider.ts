/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { createContext } from 'react';
import { EnvironmentProviderProps } from '../types';

export const EnvironmentEditorProvider = createContext<EnvironmentProviderProps | null>(null);
