/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

type ImageResultViewer = {
  itemId: string;
};

export const ImageResultViewer: React.FC<ImageResultViewer> = ({ itemId }) => {
  const [numPages, setNumPages] = useState(null);
  function onDocumentLoadSuccess({ numPages }) {
    // Only show up to 50 pages, because more will cause lag
    setNumPages(Math.min(numPages, 50));
  }

  return (
    <Document file={`response-body://${itemId}`} onLoadSuccess={onDocumentLoadSuccess}>
      {Array.from(new Array(numPages), (el, index) => (
        <Page key={`page_${index + 1}`} pageNumber={index + 1} renderAnnotationLayer={false} />
      ))}
    </Document>
  );
};
