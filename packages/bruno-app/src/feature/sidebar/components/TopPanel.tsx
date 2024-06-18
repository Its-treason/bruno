/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ActionIcon, Group, Text, Tooltip, rem } from '@mantine/core';
import { IconPackageImport, IconFolderOpen, IconPlus } from '@tabler/icons-react';
import Bruno from 'components/Bruno';
import CreateCollection from 'components/Sidebar/CreateCollection';
import ImportCollection from 'components/Sidebar/ImportCollection';
import ImportCollectionLocation from 'components/Sidebar/ImportCollectionLocation';
import { showHomePage } from 'providers/ReduxStore/slices/app';
import { importCollection, openCollection } from 'providers/ReduxStore/slices/collections/actions';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

export const TopPanel: React.FC = () => {
  const [importedCollection, setImportedCollection] = useState(null);
  const [importedTranslationLog, setImportedTranslationLog] = useState({});
  const [createCollectionModalOpen, setCreateCollectionModalOpen] = useState(false);
  const [importCollectionModalOpen, setImportCollectionModalOpen] = useState(false);
  const [importCollectionLocationModalOpen, setImportCollectionLocationModalOpen] = useState(false);
  const dispatch = useDispatch();

  const handleImportCollection = ({ collection, translationLog }) => {
    setImportedCollection(collection);
    if (translationLog) {
      setImportedTranslationLog(translationLog);
    }
    setImportCollectionModalOpen(false);
    setImportCollectionLocationModalOpen(true);
  };

  const handleImportCollectionLocation = (collectionLocation) => {
    dispatch(importCollection(importedCollection, collectionLocation))
      // @ts-expect-error
      .then(() => {
        setImportCollectionLocationModalOpen(false);
        setImportedCollection(null);
        toast.success('Collection imported successfully');
      })
      .catch((err) => {
        setImportCollectionLocationModalOpen(false);
        console.error(err);
        toast.error('An error occurred while importing the collection. Check the logs for more information.');
      });
  };

  const handleTitleClick = () => dispatch(showHomePage());

  const handleOpenCollection = () => {
    // @ts-expect-error
    dispatch(openCollection()).catch((err) => {
      console.error('Could not open collection!', err);
      toast.error('An error occurred while opening the collection');
    });
  };

  return (
    <Group
      justify="space-between"
      gap={0}
      p={'xs'}
      style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
    >
      {createCollectionModalOpen ? <CreateCollection onClose={() => setCreateCollectionModalOpen(false)} /> : null}
      {importCollectionModalOpen ? (
        <ImportCollection onClose={() => setImportCollectionModalOpen(false)} handleSubmit={handleImportCollection} />
      ) : null}
      {importCollectionLocationModalOpen ? (
        <ImportCollectionLocation
          collectionName={importedCollection.name}
          translationLog={importedTranslationLog}
          onClose={() => setImportCollectionLocationModalOpen(false)}
          handleSubmit={handleImportCollectionLocation}
        />
      ) : null}

      <Group gap={4} onClick={handleTitleClick}>
        <Bruno width={30} />
        <Text>Bruno lazer</Text>
      </Group>

      <ActionIcon.Group>
        <Tooltip label="Import collection" openDelay={250}>
          <ActionIcon
            variant="default"
            size={'md'}
            aria-label={'Import collection'}
            onClick={() => setImportCollectionModalOpen(true)}
          >
            <IconPackageImport style={{ width: rem(16) }} stroke={1.5} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Open collection" openDelay={250}>
          <ActionIcon variant="default" size={'md'} aria-label={'Open collection'} onClick={handleOpenCollection}>
            <IconFolderOpen style={{ width: rem(16) }} stroke={1.5} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Create collection" openDelay={250}>
          <ActionIcon
            variant="default"
            size={'md'}
            aria-label={'Create collection'}
            onClick={() => setCreateCollectionModalOpen(true)}
          >
            <IconPlus style={{ width: rem(16) }} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      </ActionIcon.Group>
    </Group>
  );
};
