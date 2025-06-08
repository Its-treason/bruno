import React, { useCallback } from 'react';
import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import { Text } from '@mantine/core';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { TextBodyEditor } from './editors/TextBodyEditor';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import { FormUrlEncodedList } from './editors/form-url-encoded/FormUrlEncodedList';
import { MultipartFormList } from './editors/multipart-form/MultipartFormList';
import { FileList } from './editors/file/FileList';

type BodyEditorProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
};

export const BodyEditor: React.FC<BodyEditorProps> = ({ item, collection }) => {
  const dispatch = useDispatch();
  const body = item.draft ? get(item, 'draft.request.body') : get(item, 'request.body');

  const onRun = useCallback(() => {
    dispatch(sendRequest(item, collection.uid));
  }, []);
  const onSave = useCallback(() => {
    dispatch(saveRequest(item, collection.uid));
  }, []);

  switch (body.mode) {
    case 'json':
    case 'xml':
    case 'text':
    case 'sparql':
      return (
        <TextBodyEditor
          collectionUid={collection.uid}
          body={String(body[body.mode] ?? '')}
          itemUid={item.uid}
          mode={body.mode}
          onRun={onRun}
          onSave={onSave}
        />
      );
    case 'formUrlEncoded':
      return (
        <FormUrlEncodedList
          body={body['formUrlEncoded'] ?? []}
          collectionUid={collection.uid}
          itemUid={item.uid}
          onRun={onRun}
          onSave={onSave}
        />
      );
    case 'multipartForm':
      return (
        <MultipartFormList
          body={body['multipartForm'] ?? []}
          collectionUid={collection.uid}
          itemUid={item.uid}
          onRun={onRun}
          onSave={onSave}
        />
      );
    case 'file':
      return (
        <FileList
          body={body['file'] ?? []}
          collectionUid={collection.uid}
          itemUid={item.uid}
          onRun={onRun}
          onSave={onSave}
        />
      );
    default:
      return <Text ta={'center'}>No body</Text>;
  }
};
