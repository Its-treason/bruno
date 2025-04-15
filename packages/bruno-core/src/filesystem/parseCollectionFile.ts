import fs from 'node:fs/promises';
import path from 'node:path';
import { ParsedFile } from './types';

export async function parseCollectionFile(itemPath: string, collectionPath: string): Promise<ParsedFile | null> {
  const fileType = await determineFileType(itemPath, collectionPath);

  switch (fileType) {
    case 'COLLECTION_METADATA':
      const data = await parseCollectionMetadataFile(itemPath);

      return {
        type: 'collectionMeta'
      };
    case 'BRUNO_JSON':
    case 'BRU_FILE':
    case 'DIR':
    case 'DIR_METADATA':
    case 'ENVIRONMENT_FILE':
    case 'ENVIRONMENT_DIR': // Ignore the Environment directory
    case 'UNKNOWN':
      return null;
    default:
      throw new Error(`Unhandled fileType while parsing file: "${fileType}"`);
  }
}

type FileType =
  | 'UNKNOWN' // Some other file. Will be ignored
  | 'ENVIRONMENT_DIR' // Environment directory of the collection. Will be ignored
  | 'ENVIRONMENT_FILE' // Environment file (*.bru file inside the ENVIRONMENT_DIR)
  | 'BRU_FILE' // Normal request .bru file
  | 'DIR' // Normal directory
  | 'DIR_METADATA' // `folder.bru` file containing information (name & seq) about the current directory
  | 'COLLECTION_METADATA' // `collection.bru` file
  | 'BRUNO_JSON'; // `bruno.json` with config settings for the current collection

export async function determineFileType(itemPath: string, collectionPath: string): Promise<FileType> {
  const itemStats = await fs.stat(itemPath);

  const environmentDir = path.join(collectionPath, 'environments');
  if (itemStats.isDirectory()) {
    if (itemPath === environmentDir) {
      return 'ENVIRONMENT_DIR';
    }
    return 'DIR';
  }

  const basename = path.basename(itemPath).toLowerCase();
  const isInCollectionRoot = path.dirname(itemPath) === collectionPath;

  if (basename === 'bruno.json' && isInCollectionRoot) {
    return 'BRUNO_JSON';
  }

  if (basename === 'collection.bru' && isInCollectionRoot) {
    return 'COLLECTION_METADATA';
  }

  if (basename === 'folder.bru' && !isInCollectionRoot) {
    return 'DIR_METADATA';
  }

  if (path.dirname(itemPath) === environmentDir && basename.endsWith('.bru')) {
    return 'ENVIRONMENT_FILE';
  }

  if (basename.endsWith('.bru')) {
    return 'BRU_FILE';
  }

  return 'UNKNOWN';
}

// #region Metadata
// This includes `collection.bru` and `folder.bru` files. Both files use the same parser function from @usebruno/lang

async function parseCollectionMetadataFile(itemPath: string): Promise<any> {}
