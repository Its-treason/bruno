import React, { useCallback } from 'react';
import get from 'lodash/get';
import FormUrlEncodedParams from 'components/RequestPane/FormUrlEncodedParams';
import MultipartFormParams from 'components/RequestPane/MultipartFormParams';
import { useDispatch } from 'react-redux';
import { updateRequestBody } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import CodeEditor from 'components/CodeEditor';
import { Text } from '@mantine/core';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { TextBodyEditor } from './editors/TextBodyEditor';

type BodyEditorProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
};

export const BodyEditor: React.FC<BodyEditorProps> = ({ item, collection }) => {
  const dispatch = useDispatch();
  const body = item.draft ? get(item, 'draft.request.body') : get(item, 'request.body');
  const bodyMode = item.draft ? get(item, 'draft.request.body.mode') : get(item, 'request.body.mode');

  const onRun = useCallback(() => {}, []);

  switch (bodyMode) {
    case 'json':
    case 'xml':
    case 'text':
    case 'sparql':
      return <TextBodyEditor collectionUid={collection.uid} item={item} />;
    case 'formUrlEncoded':
      return <FormUrlEncodedParams item={item} collection={collection} />;
    case 'multipartForm':
      return <MultipartFormParams item={item} collection={collection} />;
    case 'file':
      return 'file fun';
    default:
      return <Text ta={'center'}>No body</Text>;
  }
};
