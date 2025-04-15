export type ParsedFile =
  | {
      type: 'request';
    }
  | {
      type: 'dir';
    }
  | {
      type: 'collectionMeta';
    }
  | {
      type: 'brunoJson';
    };
