/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Anchor, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useEnvironmentEditor } from '../../hooks/useEnvironmentEditor';

export const ManageSecretModals: React.FC = () => {
  const { setActiveModal, activeModal } = useEnvironmentEditor();

  return (
    <Modal
      opened={activeModal === 'manage-secrets'}
      onClose={() => {
        setActiveModal(null);
      }}
      title="Managing secrets"
    >
      <Stack gap={'xs'}>
        <Text>In any collection, there are secrets that need to be managed.</Text>
        <Text>These secrets can be anything such as API keys, passwords, or tokens.</Text>
        <Text>Bruno offers two approaches to manage secrets in collections.</Text>
        <Text>
          Read more about it in our{' '}
          <Anchor href="https://docs.usebruno.com/secrets-management/overview" target="_blank">
            docs
          </Anchor>
          .
        </Text>
      </Stack>
      <Group justify="flex-end" mt={'md'}>
        <Button
          variant="filled"
          onClick={() => {
            setActiveModal(null);
          }}
        >
          Close
        </Button>
      </Group>
    </Modal>
  );
};
