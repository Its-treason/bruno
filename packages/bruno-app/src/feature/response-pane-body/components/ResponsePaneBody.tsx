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
import { JsonFilterResultViewer } from './viewer/JsonFilterResultViewer';
import { Button, Stack, Text } from '@mantine/core';

type ResponsePaneBodyProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
  disableRun: boolean;
  size: number;
  error?: Error;
};

export const ResponsePaneBody: React.FC<ResponsePaneBodyProps> = ({ item, collection, disableRun, size, error }) => {
  const [mode, setMode] = useState<ResponseMode>(error ? ['error', null] : ['raw', null]);
  const [dismissedSizeWarning, setDismissedSizeWarning] = useState(false);

  const preview = useMemo(() => {
    if (mode[0] === 'raw') {
      return <TextResultViewer collectionUid={collection.uid} item={item} disableRun={disableRun} />;
    } else if (mode[0] === 'pretty') {
      if (mode[1] === 'json') {
        return <JsonFilterResultViewer collectionUid={collection.uid} item={item} disableRun={disableRun} />;
      }
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

  if (size > 25_000_000 && !dismissedSizeWarning) {
    return (
      <Stack align="center" mt={'xl'}>
        <Text c={'red'}>Warning: Response is over 10 MB!</Text>
        <Text size="sm">Rendering such a large response may cause performance issues.</Text>
        <Button variant={'filled'} onClick={() => setDismissedSizeWarning(true)} mt={'xl'}>
          Show anyway
        </Button>
      </Stack>
    );
  }

  return (
    <div className={classes.body}>
      <ResponseModeBar mode={mode} setMode={setMode} hasError={!!error} />
      {preview}
    </div>
  );
};
