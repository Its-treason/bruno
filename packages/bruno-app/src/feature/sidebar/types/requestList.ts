/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
export type RequestListItem =
  | {
      type: 'collection';
      name: string;
      uid: string;
      collapsed: boolean;
      active: boolean;
    }
  | {
      type: 'folder';
      name: string;
      uid: string;
      parentUid: string | null; // Used just the key
      collectionUid: string;
      collapsed: boolean;
      indent: number;
      active: boolean;
    }
  | {
      type: 'request';
      name: string;
      uid: string;
      parentUid: string | null; // Used just the key
      collectionUid: string;
      method: string;
      indent: number;
      active: boolean;
    };
