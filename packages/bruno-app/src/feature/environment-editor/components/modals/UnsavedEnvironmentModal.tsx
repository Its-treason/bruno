/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Button, Group, Modal, Text } from '@mantine/core';
import { useEnvironmentEditor } from '../../hooks/useEnvironmentEditor';

export const UnsavedEnvironmentModal: React.FC = () => {
  const { unsavedChangesCallback, setUnsavedChangesCallback, selectedEnvironment, form, onSubmit } =
    useEnvironmentEditor();

  return (
    <Modal
      opened={unsavedChangesCallback !== null}
      onClose={() => {
        setUnsavedChangesCallback(null);
      }}
      title="You have unsaved changes"
    >
      <Text>Some changes in "{selectedEnvironment?.name}" are not saved!</Text>
      <Group justify="flex-end" mt={'md'}>
        <Button
          c={'red'}
          variant="transparent"
          onClick={() => {
            form.reset();
            unsavedChangesCallback!();
            setUnsavedChangesCallback(null);
          }}
        >
          Discard changes
        </Button>
        <Button
          variant="filled"
          onClick={() => {
            onSubmit(form.getValues().variables).then(() => {
              unsavedChangesCallback!();
              setUnsavedChangesCallback(null);
            });
          }}
        >
          Save
        </Button>
      </Group>
    </Modal>
  );
};
