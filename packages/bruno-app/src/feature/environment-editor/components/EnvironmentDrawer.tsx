/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Box, Button, Divider, Drawer, Group, Space, rem } from '@mantine/core';
import { IconDownload, IconPlus, IconShieldCheck } from '@tabler/icons-react';
import { EnvironmentList } from './list/EnvironmentList';
import { EnvironmentForm } from './form/EnvironmentForm';
import { useEnvironmentEditorProvider } from '../hooks/useEnvironmentEditorProvider';
import { EnvironmentEditorProvider } from '../provider/EnvironmentEditorProvider';
import classes from './EnvironmentDrawer.module.css';
import { UnsavedEnvironmentModal } from './modals/UnsavedEnvironmentModal';
import { CloneEnvironmentModal } from './modals/CloneEnvironmentModal';
import CreateEnvironment from 'components/Environments/EnvironmentSettings/CreateEnvironment';
import { CreateEnvironmentModal } from './modals/CreateEnvironmentModal';
import { DeleteEnvironmentModal } from './modals/DeleteEnvironmentModal';
import { RenameEnvironmentModal } from './modals/RenameEnvironmentModal';

type EnvironmentDrawerProps = {
  opened: boolean;
  onClose: () => void;
  collection: any;
};

export const EnvironmentDrawer: React.FC<EnvironmentDrawerProps> = ({
  opened,
  onClose,
  collection = { environments: [] }
}) => {
  const providerData = useEnvironmentEditorProvider(collection, onClose);

  return (
    <Drawer
      opened={opened}
      onClose={providerData.onClose}
      title="Environment editor"
      size={'75%'}
      position={'right'}
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
          variant="subtle"
          onClick={() => providerData.openActionModal('import')}
          leftSection={<IconDownload style={{ width: rem(14) }} />}
        >
          Import environment
        </Button>

        <Space style={{ flexGrow: 1 }} />
        <Button
          variant="subtle"
          onClick={() => providerData.openActionModal('manage-secrets')}
          leftSection={<IconShieldCheck style={{ width: rem(14) }} />}
          style={{ float: 'right' }}
        >
          Managing secrets
        </Button>
      </Group>
      <Divider mt={'md'} />

      <EnvironmentEditorProvider.Provider value={providerData}>
        <CloneEnvironmentModal />
        <CreateEnvironmentModal />
        <DeleteEnvironmentModal />
        <RenameEnvironmentModal />
        <UnsavedEnvironmentModal />

        <Box className={classes.content}>
          <EnvironmentList />
          <EnvironmentForm />
        </Box>
      </EnvironmentEditorProvider.Provider>
    </Drawer>
  );
};
