/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { createContext } from 'react';

export type SidebarActionTypes =
  | 'generate'
  | 'clone'
  | 'delete'
  | 'rename'
  | 'new-request'
  | 'new-folder'
  | 'clone-collection'
  | 'close-collection'
  | 'export-collection'
  | 'rename-collection'
  | null;

export type SidebarActionContextData = {
  setActiveAction: (type: SidebarActionTypes, collectionUid: string, itemUid?: string) => void;

  openInExplorer: (collectionUid: string, itemUid?: string) => void;
  openInEditor: (collectionUid: string, itemUid: string) => void;
  editBrunoJson: (collectionUid: string) => void;

  itemClicked: (collectionUid: string, itemUid?: string, toggleFolder?: boolean) => void;
  openCollectionSettings: (collectionUid: string) => void;
  openFolderSettings: (collectionUid: string, folderUid: string) => void;
  openRunner: (collectionUid: string, itemUid?: string) => void;
  runRequest: (collectionUid: string, itemUid: string) => void;
};

export const SidebarActionContext = createContext<SidebarActionContextData | null>(null);
