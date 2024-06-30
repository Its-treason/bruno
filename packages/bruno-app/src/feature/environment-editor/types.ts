/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { UseFormReturnType } from '@mantine/form';
import { EnvironmentSchema, EnvironmentVariableSchema } from '@usebruno/schema';

export type EnvironmentProviderProps = {
  collection: any;
  allEnvironments: EnvironmentSchema[];

  selectedEnvironment: EnvironmentSchema | null;
  form: UseFormReturnType<{ variables: EnvironmentVariableSchema[] }>;

  onSubmit: (values: EnvironmentVariableSchema[]) => Promise<void>;
  onEnvironmentSwitch: (targetEnvironmentId: string, ignoreUnsaved?: boolean) => void;
  onClose: () => void;

  activeModal: EnvironmentEditorModalTypes;
  setActiveModal: (newType: EnvironmentEditorModalTypes) => void;
  openActionModal: (actionModalType: EnvironmentEditorModalTypes) => void;

  unsavedChangesCallback: (() => void) | null;
  setUnsavedChangesCallback: (newCallback: null) => void;
};

export type EnvironmentEditorModalTypes = 'create' | 'clone' | 'rename' | 'delete' | 'import' | 'manage-secrets' | null;
