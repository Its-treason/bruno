const _ = require('lodash');
const Store = require('electron-store');
const { isDirectory } = require('../utils/filesystem');

class LastOpenedCollections {
  static lastOpened;
  static getInstance() {
    if (!LastOpenedCollections.lastOpened) {
      LastOpenedCollections.lastOpened = new LastOpenedCollections();
    }
    return LastOpenedCollections.lastOpened;
  }

  constructor() {
    this.store = new Store({
      name: 'preferences',
      clearInvalidConfig: true
    });
    console.log(`Preferences file is located at: ${this.store.path}`);
  }

  getAll() {
    return this.store.get('lastOpenedCollections') || [];
  }

  add(collectionPath) {
    const collections = this.store.get('lastOpenedCollections') || [];

    if (isDirectory(collectionPath)) {
      if (!collections.includes(collectionPath)) {
        collections.push(collectionPath);
        this.store.set('lastOpenedCollections', collections);
      }
    }
  }

  remove(collectionPath) {
    let collections = this.store.get('lastOpenedCollections') || [];

    if (collections.includes(collectionPath)) {
      collections = _.filter(collections, (c) => c !== collectionPath);
      this.store.set('lastOpenedCollections', collections);
    }
  }

  removeAll() {
    return this.store.set('lastOpenedCollections', []);
  }

  reorder(sourceCollectionPath, targetCollectionPath) {
    const withoutSource = this.store.get('lastOpenedCollections').filter((path) => path !== sourceCollectionPath);

    const targetIndex = withoutSource.indexOf(targetCollectionPath);

    this.store.set('lastOpenedCollections', withoutSource.toSpliced(targetIndex, 0, sourceCollectionPath));
  }
}

module.exports = LastOpenedCollections;
