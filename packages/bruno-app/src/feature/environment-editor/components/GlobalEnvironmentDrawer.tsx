/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Anchor, Box, Button, Divider, Drawer, Group, Space, rem } from '@mantine/core';
import { IconDownload, IconPlus } from '@tabler/icons-react';
import { EnvironmentList } from './list/EnvironmentList';
import { EnvironmentForm } from './form/EnvironmentForm';
import { EnvironmentEditorProvider } from '../provider/EnvironmentEditorProvider';
import classes from './EnvironmentDrawer.module.css';
import { UnsavedEnvironmentModal } from './modals/UnsavedEnvironmentModal';
import { CloneEnvironmentModal } from './modals/CloneEnvironmentModal';
import { CreateEnvironmentModal } from './modals/CreateEnvironmentModal';
import { DeleteEnvironmentModal } from './modals/DeleteEnvironmentModal';
import { RenameEnvironmentModal } from './modals/RenameEnvironmentModal';
import { ImportEnvironmentModal } from './modals/ImportEnvironmentModal';
import { ManageSecretModals } from './modals/ManageSecretsModal';
import { CodeEditorVariableProvider } from 'components/CodeEditor/CodeEditorVariableProvider';
import { useGlobalEnvironmentEditorProvider } from '../hooks/useGlobalEnvironmentEditorProvider';

type EnvironmentDrawerProps = {
  opened: boolean;
  onClose: () => void;
};

export const GlobalEnvironmentDrawer: React.FC<EnvironmentDrawerProps> = ({ opened, onClose }) => {
  const providerData = useGlobalEnvironmentEditorProvider(onClose);

  return (
    <Drawer
      opened={opened}
      onClose={providerData.onClose}
      title={providerData.collection ? "Environment editor" : "Global environment editor"}
      size={1500}
      position={'right'}
      closeOnEscape={providerData.activeModal === null}
      styles={{
        content: { display: 'grid', gridTemplateRows: 'auto 1fr' },
        body: { padding: 0, display: 'grid', gridTemplateRows: 'auto auto 1fr' }
      }}
    >
      <Group mx={'md'}>
        <Button
          variant="filled"
          onClick={() => providerData.openActionModal('create')}
          leftSection={<IconPlus style={{ width: rem(14) }} />}
        >
          New environment
        </Button>
        <Button
          variant="default"
          onClick={() => providerData.openActionModal('import')}
          leftSection={<IconDownload style={{ width: rem(14) }} />}
        >
          Import environment
        </Button>

        <Space style={{ flexGrow: 1 }} />

        <Anchor onClick={() => providerData.openActionModal('manage-secrets')}>Managing secrets</Anchor>
      </Group>
      <Divider mt={'md'} />

      <EnvironmentEditorProvider.Provider value={providerData}>
        <CloneEnvironmentModal />
        <CreateEnvironmentModal />
        <DeleteEnvironmentModal />
        <RenameEnvironmentModal />
        <UnsavedEnvironmentModal />
        <ImportEnvironmentModal />
        <ManageSecretModals />

        <Box className={classes.content}>
          <CodeEditorVariableProvider ignoreRequestVariables>
            <EnvironmentList />
            <EnvironmentForm />
          </CodeEditorVariableProvider>
        </Box>
      </EnvironmentEditorProvider.Provider>
    </Drawer>
  );
};
