import { CollectionWatcher, parseCollectionFile, ParsedFile, WatcherEvent } from '@usebruno/core';
import { parseDeletedFile } from '@usebruno/core/dist/filesystem/parseCollectionFile';
import { app, BrowserWindow } from 'electron';
import path from 'node:path';

// Used for Parcel snapshots
const storagePath = path.join(app.getPath('userData'), 'storage');

// CollectionId -> CollectionWatcher
const watchers: Map<string, CollectionWatcher> = new Map();

export async function createCollectionWatcher(collectionDir: string, ignore: string[], collectionId: string) {
  const watcher = new CollectionWatcher(
    collectionDir,
    ignore,
    storagePath,
    (events) => {
      handleFileUpdates(collectionDir, collectionId, events);
    },
    (err) => {
      console.error('Error in watcher', err);
    }
  );
  await watcher.start();

  watchers.set(collectionId, watcher);
}

async function handleFileUpdates(collectionDir: string, collectionId: string, events: WatcherEvent[]) {
  const parsedFiles: ParsedFile[] = [];
  for (const event of events) {
    if (event.type === 'delete') {
      parsedFiles.push(parseDeletedFile(event.path, collectionDir));
      break;
    }

    try {
      const parsedFile = await parseCollectionFile(event.path, collectionDir);
      if (parsedFile) {
        parsedFiles.push(parsedFile);
      }
    } catch (error) {
      console.error('Could not parse updated file', error, event);
    }
  }

  const browserWindows = BrowserWindow.getAllWindows();
  for (const window of browserWindows) {
    window.webContents.send('collection:items-updated', collectionId, parsedFiles);
  }
}
