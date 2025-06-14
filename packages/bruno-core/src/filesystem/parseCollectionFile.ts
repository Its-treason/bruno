import fs from 'node:fs/promises';
import path, { basename, dirname } from 'node:path';
import { ParsedFile } from './types';
import {
  BrunoConfigSchema,
  brunoConfigSchema,
  collectionMetadataSchema,
  CollectionMetadataSchema,
  DirMetaSchema,
  environmentSchema,
  EnvironmentSchema,
  FileMetaSchema,
  requestSchema,
  RequestSchema
} from '@usebruno/schema';
import { bruToEnvJsonV2, bruToJsonV2, collectionBruToJson } from '@usebruno/lang';
import { createHash } from 'node:crypto';
import { ItemIdStore } from './ItemIdStore';
import { statSync } from 'node:fs';
import { AbstractSecretStore } from './SecretStore';

export async function parseCollectionFile(itemPath: string, collectionPath: string): Promise<ParsedFile | null> {
  const fileType = await determineFileType(itemPath, collectionPath);

  switch (fileType) {
    case 'COLLECTION_DATA':
      return {
        type: 'collectionMeta',
        data: await parseMetadataBru(itemPath)
      };
    case 'BRUNO_JSON':
      return {
        type: 'brunoJson',
        data: await parseBrunoJson(itemPath)
      };
    case 'BRU_FILE':
      return {
        type: 'request',
        id: getItemId(itemPath),
        parentId: getParentId(itemPath, collectionPath),
        data: await parseRequestBru(itemPath),
        meta: await collectFileMeta(itemPath)
      };
    case 'DIR':
      return {
        type: 'dir',
        meta: await collectDirMeta(itemPath),
        id: getItemId(itemPath),
        parentId: getParentId(itemPath, collectionPath)
      };
    case 'DIR_DATA':
      return {
        type: 'dirMeta',
        data: await parseMetadataBru(itemPath),
        meta: await collectDirMeta(itemPath),
        id: getItemId(itemPath),
        parentId: getParentId(itemPath, collectionPath)
      };
    case 'ENVIRONMENT_FILE':
      return {
        type: 'envFile',
        data: await parseEnvironmentBru(itemPath, collectionPath),
        meta: await collectFileMeta(itemPath)
      };
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
  | 'DIR_DATA' // `folder.bru` file containing information (name & seq) about the current directory
  | 'COLLECTION_DATA' // `collection.bru` file
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
    return 'COLLECTION_DATA';
  }

  if (basename === 'folder.bru' && !isInCollectionRoot) {
    return 'DIR_DATA';
  }

  if (path.dirname(itemPath) === environmentDir && basename.endsWith('.bru')) {
    return 'ENVIRONMENT_FILE';
  }

  if (basename.endsWith('.bru')) {
    return 'BRU_FILE';
  }

  return 'UNKNOWN';
}

// #region File parser
// This includes `collection.bru` and `folder.bru` files. Both files use the same parser function from @usebruno/lang
async function parseMetadataBru(filePath: string): Promise<CollectionMetadataSchema> {
  const contents = await fs.readFile(filePath);

  const unknownData = collectionBruToJson(contents.toString('utf-8'));
  unknownData.contentHash = createFileContentHash(contents);

  return await collectionMetadataSchema.parseAsync(unknownData);
}

async function parseRequestBru(filePath: string): Promise<RequestSchema> {
  const contents = await fs.readFile(filePath);

  const unknownData = bruToJsonV2(contents.toString('utf-8'));
  unknownData.contentHash = createFileContentHash(contents);

  return await requestSchema.parseAsync(unknownData);
}

async function parseEnvironmentBru(filePath: string, collectionPath: string): Promise<EnvironmentSchema> {
  const contents = await fs.readFile(filePath);

  const unknownData = bruToEnvJsonV2(contents.toString('utf-8'));
  unknownData.contentHash = createFileContentHash(contents);

  const environment = await environmentSchema.parseAsync(unknownData);

  const store = AbstractSecretStore.getInstance();
  for (const variable of environment.variables) {
    if (variable.secret) {
      // Get the secret from the Store and decrypt it. Will default to "" if no secret was found
      variable.value = store.getSecret(collectionPath, environment.name, variable.name);
    }
  }

  return environment;
}

async function parseBrunoJson(filePath: string): Promise<BrunoConfigSchema> {
  const contents = await fs.readFile(filePath);

  const unknownData = JSON.parse(contents.toString('utf-8'));

  return await brunoConfigSchema.parseAsync(unknownData);
}
// #endRegion

// #region Metadata
async function collectDirMeta(itemPath: string): Promise<DirMetaSchema> {
  return {
    basename: basename(itemPath),
    dirname: dirname(itemPath),
    path: itemPath
  };
}

async function collectFileMeta(itemPath: string): Promise<FileMetaSchema> {
  return {
    basename: basename(itemPath),
    dirname: dirname(itemPath),
    path: itemPath,
    size: statSync(itemPath).size
  };
}

function getItemId(itemPath: string): string {
  const store = ItemIdStore.getInstance();
  return store.getOrCreate(itemPath);
}

function getParentId(itemPath: string, collectionPath: string): string | undefined {
  const parentDir = dirname(itemPath);
  // If the Item is in the collection root, it has no parentId
  if (parentDir === collectionPath) {
    return;
  }
  const store = ItemIdStore.getInstance();
  return store.getOrCreate(parentDir);
}

function createFileContentHash(buffer: Buffer): string {
  return createHash('sha1').update(buffer).digest('hex');
}
// #endRegion
