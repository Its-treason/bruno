const { each, filter } = require('lodash');

const sortCollection = (collection) => {
  const items = collection.items || [];
  let folderItems = filter(items, (item) => item.type === 'folder');
  let requestItems = filter(items, (item) => item.type !== 'folder');

  folderItems = folderItems.sort((a, b) => a.name.localeCompare(b.name));
  requestItems = requestItems.sort((a, b) => a.seq - b.seq);

  collection.items = folderItems.concat(requestItems);

  each(folderItems, (item) => {
    sortCollection(item);
  });
};

const sortFolder = (folder = {}) => {
  const items = folder.items || [];
  let folderItems = filter(items, (item) => item.type === 'folder');
  let requestItems = filter(items, (item) => item.type !== 'folder');

  folderItems = folderItems.sort((a, b) => a.name.localeCompare(b.name));
  requestItems = requestItems.sort((a, b) => a.seq - b.seq);

  folder.items = folderItems.concat(requestItems);

  each(folderItems, (item) => {
    sortFolder(item);
  });

  return folder;
};

const findItemInCollection = (collection, itemId) => {
  let item = null;

  if (collection.uid === itemId) {
    return collection;
  }

  if (collection.items && collection.items.length) {
    collection.items.forEach((item) => {
      if (item.uid === itemId) {
        item = item;
      } else if (item.type === 'folder') {
        item = findItemInCollection(item, itemId);
      }
    });
  }

  return item;
};

const getAllRequestsInFolderRecursively = (items = []) => {
  // This is the sort function from useRequestList.tsx
  items.sort((a, b) => {
    if (a.seq === undefined && b.seq !== undefined) {
      return -1;
    } else if (a.seq !== undefined && b.seq === undefined) {
      return 1;
    } else if (a.seq === undefined && b.seq === undefined) {
      return 0;
    }
    return a.seq < b.seq ? -1 : 1;
  });

  const requests = [];
  for (const item of items) {
    if (item.type !== 'folder') {
      requests.push(item);
    } else {
      requests.push(...getAllRequestsInFolderRecursively(item.items));
    }
  }

  return requests;
};

module.exports = {
  sortCollection,
  sortFolder,
  findItemInCollection,
  getAllRequestsInFolderRecursively
};
