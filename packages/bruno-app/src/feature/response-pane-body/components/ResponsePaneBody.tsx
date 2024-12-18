/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import React, { useEffect, useMemo, useState } from 'react';
import classes from './ResponsePaneBody.module.scss';
import { ResponseModeBar } from './ResponseModeBar';
import { PrettyMode, PreviewMode, ResponseMode } from '../types/preview';
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
  error?: Error | string;
  initialPreviewModes?: { pretty: string | null; preview: string | null };
};

export const ResponsePaneBody: React.FC<ResponsePaneBodyProps> = ({
  item,
  collection,
  disableRun,
  size,
  error,
  initialPreviewModes
}) => {
  const [mode, setMode] = useState<ResponseMode>(error ? ['error', null] : ['raw', null]);
  const [dismissedSizeWarning, setDismissedSizeWarning] = useState(false);

  useEffect(() => {
    if (!initialPreviewModes) {
      setMode(['raw', null]);
      return;
    }

    if (initialPreviewModes.pretty) {
      setMode(['pretty', initialPreviewModes.pretty as any]);
    }
    if (initialPreviewModes.preview) {
      setMode(['preview', initialPreviewModes.preview as any]);
    }
    // Explicity listen for changes for the values. So that this does not run, if the object ref changes
  }, [initialPreviewModes?.pretty, initialPreviewModes?.preview]);

  const preview = useMemo(() => {
    if (mode[0] === 'raw') {
      return <TextResultViewer collectionUid={collection.uid} item={item} disableRun={disableRun} />;
    } else if (mode[0] === 'pretty') {
      //                        Disable the JSON filter if the response is way to large
      if (mode[1] === 'json' && size < 20_000_000) {
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
  }, [mode, item.uid]);

  if (size > 10_000_000 && !dismissedSizeWarning) {
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
      <ResponseModeBar
        mode={mode}
        setMode={setMode}
        hasError={!!error}
        // TODO: We have to check if we really received a body
        hasBody={true}
        initialPrettyMode={initialPreviewModes?.pretty as PrettyMode}
        initialPreviewMode={initialPreviewModes?.preview as PreviewMode}
      />
      {preview}
    </div>
  );
};
