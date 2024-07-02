import { Collection, FolderItem, RequestItem, RequestVariable } from '../types';

function createChildToParentMap(collection: Collection): Map<string, RequestItem | FolderItem> {
  const mappedItems = new Map<string, RequestItem | FolderItem>();
  const recursiveForEach = (items: (RequestItem | FolderItem)[], parent?: FolderItem) => {
    for (const item of items) {
      if (parent) {
        mappedItems.set(item.uid, parent);
      }
      if (item.type === 'folder') {
        recursiveForEach(item.items, item);
      }
    }
  };
  recursiveForEach(collection.items);

  return mappedItems;
}

export type FolderData = {
  uid: string;
  name: string;

  preReqScript?: string;
  postReqScript?: string;
  testScript?: string;
  headers?: {
    name: string;
    value: string;
    enabled: boolean;
  }[];
  preReqVariables?: RequestVariable[];
  postReqVariables?: RequestVariable[];
};

export function collectFolderData(collection: Collection, itemUid: string) {
  const mappedItems = createChildToParentMap(collection);

  const folderData: FolderData[] = [];
  let folderItem;
  while ((folderItem = mappedItems.get(folderItem?.uid ?? itemUid))) {
    if (folderItem.type !== 'folder') {
      throw new Error('Encountered an Request with children');
    }
    folderData.unshift({
      uid: folderItem.uid,
      name: folderItem.name,

      preReqScript: folderItem.root?.request?.script?.req,
      postReqScript: folderItem.root?.request?.script?.res,
      testScript: folderItem.root?.request?.tests,
      headers: folderItem.root?.request?.headers,
      preReqVariables: folderItem.root?.request?.vars?.req,
      postReqVariables: folderItem.root?.request?.vars?.res
    });
  }

  return folderData;
}
