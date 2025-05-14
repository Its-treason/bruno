import { Preferences, preferencesSchema } from '@usebruno/schema';
import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';

const preferencesPath = path.join(app.getPath('userData'), 'appPreferences.json');
let currentPreferences: null | Preferences = null;

export async function savePreferences(newPreferences: unknown): Promise<void> {
  currentPreferences = preferencesSchema.parse(newPreferences);
  await fs.writeFile(preferencesPath, JSON.stringify(currentPreferences), 'utf-8');
}

export async function getPreferences(): Promise<Preferences> {
  if (currentPreferences !== null) {
    return currentPreferences;
  }

  try {
    const contents = JSON.parse(await fs.readFile(preferencesPath, 'utf-8'));
    currentPreferences = preferencesSchema.parse(contents);
  } catch (error) {
    console.error('Could not load preferences! Fallback to default preferences.', error);
    currentPreferences = preferencesSchema.parse({} as unknown);
  }

  return currentPreferences;
}
