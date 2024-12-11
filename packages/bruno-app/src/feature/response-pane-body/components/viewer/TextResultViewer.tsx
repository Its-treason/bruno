/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useQuery } from '@tanstack/react-query';
import { RequestItemSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import { sendRequest } from 'providers/ReduxStore/slices/collections/actions';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { LoadingResponse } from '../LoadingResponse';
import { PrettyMode } from '../../types/preview';

type TextResultViewerProps = {
  item: RequestItemSchema;
  collectionUid: string;
  disableRun: boolean;
  format?: PrettyMode;
};

// Map PrettyModes to Prettier parser: https://prettier.io/docs/en/options#parser
const parseMap: Record<PrettyMode, string> = {
  html: 'html',
  json: 'json',
  xml: 'html',
  yaml: 'yaml'
};

export const TextResultViewer: React.FC<TextResultViewerProps> = ({ collectionUid, item, format, disableRun }) => {
  const dispatch = useDispatch();

  const onRun = useCallback(() => {
    if (!disableRun) {
      dispatch(sendRequest(item, collectionUid));
    }
  }, []);

  const value = useQuery({
    queryKey: ['response-body', item.uid, format],
    retry: false,
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => {
      const param = format ? `?format=${parseMap[format]}` : '';
      const data = await fetch(`response-body://${item.uid}${param}`);
      return data.text();
    }
  });

  if (value.isLoading) {
    return <LoadingResponse />;
  }

  return <CodeEditor onRun={onRun} value={value.data} mode={format} height={'100%'} readOnly />;
};
