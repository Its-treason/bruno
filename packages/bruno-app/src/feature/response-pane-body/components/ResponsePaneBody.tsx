/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import React, { useMemo, useState } from 'react';
import classes from './ResponsePaneBody.module.scss';
import { ResponseModeBar } from './ResponseModeBar';
import { ResponseMode } from '../types/preview';
import { TextResultViewer } from './viewer/TextResultViewer';
import { AudioResultViewer } from './viewer/AudioResultViewer';
import { HtmlResultViewer } from './viewer/HtmlResultViewer';
import { ImageResultViewer } from './viewer/ImageResultViewer';
import { VideoResultViewer } from './viewer/VIdeoResultViewer';
import { ErrorResultViewer } from './viewer/ErrorResultViewer';
import { PdfResultViewer } from './viewer/PdfResultViewer';

type ResponsePaneBodyProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
  disableRun: boolean;
  error?: Error;
};

export const ResponsePaneBody: React.FC<ResponsePaneBodyProps> = ({ item, collection, disableRun, error }) => {
  const [mode, setMode] = useState<ResponseMode>(error ? ['error', null] : ['raw', null]);

  const preview = useMemo(() => {
    if (mode[0] === 'raw') {
      return <TextResultViewer collectionUid={collection.uid} item={item} disableRun={disableRun} />;
    } else if (mode[0] === 'pretty') {
      return <TextResultViewer collectionUid={collection.uid} item={item} format={mode[1]} disableRun={disableRun} />;
    } else if (mode[0] === 'error') {
      return <ErrorResultViewer error={error!} />;
    }

    switch (mode[1]) {
      case 'audio':
        return <AudioResultViewer itemId={item.uid} />;
      case 'html':
        // @ts-expect-error
        return <HtmlResultViewer itemId={item.uid} originUrl={item.requestSent?.url || ''} />;
      case 'image':
        return <ImageResultViewer itemId={item.uid} />;
      case 'video':
        return <VideoResultViewer itemId={item.uid} />;
      case 'pdf':
        return <PdfResultViewer itemId={item.uid} />;
    }
  }, [mode]);

  return (
    <div className={classes.body}>
      <ResponseModeBar mode={mode} setMode={setMode} hasError={!!error} />
      {preview}
    </div>
  );
};
