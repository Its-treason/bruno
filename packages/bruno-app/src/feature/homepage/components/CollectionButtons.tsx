/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Button, Group, Title } from '@mantine/core';
import { IconFolderOpen, IconPackageImport, IconPlus } from '@tabler/icons-react';
import CreateCollection from 'components/Sidebar/CreateCollection';
import ImportCollection from 'components/Sidebar/ImportCollection';
import ImportCollectionLocation from 'components/Sidebar/ImportCollectionLocation';
import { importCollection, openCollection } from 'providers/ReduxStore/slices/collections/actions';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import classes from './CollectionButtons.module.scss';

export const CollectionButtons: React.FC = () => {
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

  const handleOpenCollection = () => {
    // @ts-expect-error
    dispatch(openCollection()).catch((err) => {
      console.error('Could not open collection!', err);
      toast.error('An error occurred while opening the collection');
    });
  };

  return (
    <>
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

      <Title mb={'md'} order={2}>
        Getting started
      </Title>
      <Group justify="center" grow>
        <Button
          onClick={() => setCreateCollectionModalOpen(true)}
          leftSection={<IconPlus />}
          variant={'default'}
          classNames={{
            root: classes.button,
            inner: classes.inner,
            section: classes.section,
            label: classes.label
          }}
        >
          Create collection
        </Button>
        <Button
          onClick={handleOpenCollection}
          leftSection={<IconFolderOpen />}
          variant={'default'}
          classNames={{
            root: classes.button,
            inner: classes.inner,
            section: classes.section,
            label: classes.label
          }}
        >
          Open collection
        </Button>
        <Button
          onClick={() => setImportCollectionModalOpen(true)}
          leftSection={<IconPackageImport />}
          variant={'default'}
          classNames={{
            root: classes.button,
            inner: classes.inner,
            section: classes.section,
            label: classes.label
          }}
        >
          Import collection
        </Button>
      </Group>
    </>
  );
};
