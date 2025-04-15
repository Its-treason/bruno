import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { minimatch } from 'minimatch';
import { ParsedFile } from './types';
import { parseCollectionFile } from './parseCollectionFile';

export async function parseAllCollectionFiles(collectionDir: string) {
  const ignore = await readIgnoreList(collectionDir);

  const allFiles = await readFilePathsRecursive(collectionDir, ignore);

  const results: ParsedFile[] = [];
  for (const file of allFiles) {
    let result;
    try {
      result = await parseCollectionFile(file, collectionDir);
    } catch (error) {
      // TODO: Pass this to the UI
      console.error('Could not parse collection file!', file, error);
    }

    if (result) {
      results.push(result);
    }
  }
}

const DEFAULT_IGNORE_LIST = ['node_modules', '.git'];
async function readIgnoreList(collectionDir: string) {
  const brunoJsonPath = path.join(collectionDir, 'bruno.json');

  try {
    const brunoJsonContents = await readFile(brunoJsonPath, { encoding: 'utf-8' });
    const brunoJson = JSON.parse(brunoJsonContents);

    return brunoJson.ignore ?? DEFAULT_IGNORE_LIST;
  } catch {
    return DEFAULT_IGNORE_LIST;
  }
}

async function readFilePathsRecursive(currentDir: string, ignore: string[]): Promise<string[]> {
  const items = await readdir(currentDir, { withFileTypes: true });

  const results: string[] = [];
  for (const item of items) {
    const itemPath = path.join(currentDir, item.name);

    if (ignore.some((ignorePattern) => minimatch(itemPath, ignorePattern))) {
      continue;
    }

    results.push(itemPath);
    if (item.isDirectory()) {
      results.push(...(await readFilePathsRecursive(item.name, ignore)));
    }
  }

  return results;
}
