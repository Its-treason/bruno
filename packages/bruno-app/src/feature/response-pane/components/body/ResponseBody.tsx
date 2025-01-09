/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { RequestItemSchema } from '@usebruno/schema';
import React, { useEffect, useMemo, useState } from 'react';
import classes from './ResponseBody.module.scss';
import { ResponseModeBar } from './ResponseModeBar';
import { PrettyMode, PreviewMode, ResponseMode } from '../../types/preview';
import { TextResultViewer } from './viewer/TextResultViewer';
import { AudioResultViewer } from './viewer/AudioResultViewer';
import { HtmlResultViewer } from './viewer/HtmlResultViewer';
import { ImageResultViewer } from './viewer/ImageResultViewer';
import { VideoResultViewer } from './viewer/VIdeoResultViewer';
import { ErrorResultViewer } from './viewer/ErrorResultViewer';
import { PdfResultViewer } from './viewer/PdfResultViewer';
import { JsonFilterResultViewer } from './viewer/JsonFilterResultViewer';
import { Button, Stack, Text } from '@mantine/core';
import { useStore } from 'zustand';
import { responseStore } from 'src/store/responseStore';

type ResponsePaneBodyProps = {
  item: RequestItemSchema;
  requestId: string;
  collectionUid: string;
  disableRun: boolean;
};

export const ResponseBody: React.FC<ResponsePaneBodyProps> = ({ item, collectionUid, requestId, disableRun }) => {
  const { error, previewModes, size, requestState } =
    useStore(responseStore, (state) => state.responses.get(requestId)) ?? {};

  const [mode, setMode] = useState<ResponseMode>(error ? ['error', null] : ['raw', null]);
  const [dismissedSizeWarning, setDismissedSizeWarning] = useState(false);

  useEffect(() => {
    // Set the default preview mode
    if (error) {
      setMode(['error', null]);
      return;
    }

    if (!previewModes) {
      setMode(['raw', null]);
      return;
    }

    if (previewModes.pretty) {
      setMode(['pretty', previewModes.pretty as any]);
    }
    if (previewModes.preview) {
      setMode(['preview', previewModes.preview as any]);
    }
    // Explicity listen for changes for the values. So that this does not run, if the object ref changes
  }, [previewModes?.pretty, previewModes?.preview]);

  const preview = useMemo(() => {
    if (mode[0] === 'raw') {
      return (
        <TextResultViewer collectionUid={collectionUid} item={item} requestId={requestId} disableRun={disableRun} />
      );
    } else if (mode[0] === 'pretty') {
      //                        Disable the JSON filter if the response is way to large
      if (mode[1] === 'json' && size < 20_000_000) {
        return (
          <JsonFilterResultViewer
            collectionUid={collectionUid}
            item={item}
            requestId={requestId}
            disableRun={disableRun}
          />
        );
      }
      return (
        <TextResultViewer
          collectionUid={collectionUid}
          item={item}
          requestId={requestId}
          format={mode[1]}
          disableRun={disableRun}
        />
      );
    } else if (mode[0] === 'error') {
      return <ErrorResultViewer error={error!} />;
    }

    switch (mode[1]) {
      case 'audio':
        return <AudioResultViewer requestId={requestId} />;
      case 'html':
        // @ts-expect-error
        return <HtmlResultViewer requestId={requestId} originUrl={item.requestSent?.url || ''} />;
      case 'image':
        return <ImageResultViewer requestId={requestId} />;
      case 'video':
        return <VideoResultViewer requestId={requestId} />;
      case 'pdf':
        return <PdfResultViewer requestId={requestId} />;
    }
  }, [mode, item.uid, requestId]);

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
        hasBody={size !== undefined}
        initialPrettyMode={previewModes?.pretty as PrettyMode}
        initialPreviewMode={previewModes?.preview as PreviewMode}
      />
      {preview}
    </div>
  );
};
