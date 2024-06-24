/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { UseFormReturnType } from '@mantine/form';

export type EnvironmentVariable = {
  name: string;
  uid: string;
  value: unknown;
  enabled: boolean;
  secret: boolean;
  // TODO: Are there more types
  type: 'text';
};

export type CollectionEnvironment = {
  name: string;
  uid: string;
  variables: EnvironmentVariable[];
};

export type EnvironmentProviderProps = {
  collection: any;
  allEnvironments: CollectionEnvironment[];

  selectedEnvironment: CollectionEnvironment | null;
  form: UseFormReturnType<{ variables: CollectionEnvironment['variables'] }>;

  onSubmit: (values: CollectionEnvironment['variables']) => Promise<void>;
  onEnvironmentSwitch: (targetEnvironmentId: string, ignoreUnsaved?: boolean) => void;
  onClose: () => void;

  activeModal: EnvironmentEditorModalTypes;
  setActiveModal: (newType: EnvironmentEditorModalTypes) => void;
  openActionModal: (actionModalType: EnvironmentEditorModalTypes) => void;

  unsavedChangesCallback: (() => void) | null;
  setUnsavedChangesCallback: (newCallback: null) => void;
};

export type EnvironmentEditorModalTypes = 'create' | 'clone' | 'rename' | 'delete' | 'import' | 'manage-secrets' | null;
