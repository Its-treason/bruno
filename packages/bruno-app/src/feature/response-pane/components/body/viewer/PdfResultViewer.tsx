/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
// Add support for AnnotationLayer and TextLayer
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { LoadingResponse } from '../LoadingResponse';
import classes from './PdfResultViewer.module.scss';
import { Text } from '@mantine/core';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

type PdfResultViewer = {
  requestId: string;
};

export const PdfResultViewer: React.FC<PdfResultViewer> = ({ requestId }) => {
  const [numPages, setNumPages] = useState(null);
  function onDocumentLoadSuccess({ numPages }) {
    // Only show up to 50 pages, because more will cause lag
    setNumPages(Math.min(numPages, 50));
  }

  return (
    <Document
      file={`response-body://${requestId}`}
      onLoadSuccess={onDocumentLoadSuccess}
      loading={<LoadingResponse />}
      className={classes.document}
    >
      {Array.from(new Array(numPages), (el, index) => (
        <>
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            renderAnnotationLayer={false}
            className={classes.page}
          />
          <Text mb={'xs'} c="dimmed" key={`text_${index + 1}`}>
            Page {index + 1} of {numPages}
          </Text>
        </>
      ))}
    </Document>
  );
};
