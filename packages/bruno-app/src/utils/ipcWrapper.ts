import { filterProps } from '@mantine/core';

type ShowFileDialogResult = {
  canceled: boolean;
  filePaths: string[];
  error: string | null;
};

export type ShowFileDialogFilter = {
  extensions: string[];
  name: string;
};

export type ShowFileDialogProperties = Array<
  | 'openFile'
  | 'openDirectory'
  | 'multiSelections'
  | 'showHiddenFiles'
  | 'createDirectory'
  | 'promptToCreate'
  | 'noResolveAliases'
  | 'treatPackageAsDirectory'
  | 'dontAddToRecent'
>;

export async function showOpenDialog(
  filters: ShowFileDialogFilter[],
  properties: ShowFileDialogProperties
): Promise<ShowFileDialogResult> {
  return await window.ipcRenderer.invoke('renderer:show-open-dialog', filters, properties);
}
