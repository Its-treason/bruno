/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { UseFormReturnType } from '@mantine/form';
import { EnvironmentSchema } from '@usebruno/schema';

export type Environment = {
  name: string,
  id: string,
};

export type EnvironmentVariable = {
  name: string,
  id: string,
  value: unknown,
  enabled: boolean,
  secret: boolean,
}

export type EnvironmentProviderProps = {
  collection: any|null;
  allEnvironments: Environment[];

  selectedEnvironment: Environment | null;
  form: UseFormReturnType<{ variables: EnvironmentVariable[] }>;

  onSubmit: (values: EnvironmentVariable[]) => Promise<void>;
  onEnvironmentSwitch: (targetEnvironmentId: string, ignoreUnsaved?: boolean) => void;
  onClose: () => void;

  activeModal: EnvironmentEditorModalTypes;
  setActiveModal: (newType: EnvironmentEditorModalTypes) => void;
  openActionModal: (actionModalType: EnvironmentEditorModalTypes) => void;

  unsavedChangesCallback: (() => void) | null;
  setUnsavedChangesCallback: (newCallback: null) => void;
};

export type EnvironmentEditorModalTypes = 'create' | 'clone' | 'rename' | 'delete' | 'import' | 'manage-secrets' | null;
