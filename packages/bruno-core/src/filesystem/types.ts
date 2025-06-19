import type {
  BrunoConfigSchema,
  CollectionMetadataSchema,
  DirMetaSchema,
  EnvironmentSchema,
  FileMetaSchema,
  RequestSchema
} from '@usebruno/schema';

export type ParsedFile =
  | {
      type: 'request';
      id: string;
      parentId?: string;
      data: RequestSchema;
      meta: FileMetaSchema;
    }
  | {
      type: 'dir';
      meta: DirMetaSchema;
      id: string;
      parentId?: string;
    }
  | {
      type: 'collectionMeta';
      data: CollectionMetadataSchema;
    }
  | {
      type: 'dirMeta';
      data: CollectionMetadataSchema;
      meta: DirMetaSchema;
      id: string;
      parentId?: string;
    }
  | {
      type: 'envFile';
      data: EnvironmentSchema;
      meta: FileMetaSchema;
    }
  | {
      type: 'parsingError';
      error: string;
      id: string;
      parentId?: string;
      meta: FileMetaSchema;
    }
  | {
      type: 'brunoJson';
      data: BrunoConfigSchema;
    };
