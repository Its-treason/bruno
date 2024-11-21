import CodeEditor from 'components/CodeEditor';
import { useDispatch } from 'react-redux';
import { sendRequest } from 'providers/ReduxStore/slices/collections/actions';
import 'pdfjs-dist/build/pdf.worker';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import PdfResultViewer from 'components/ResponsePane/QueryResult/QueryResultViewer/PdfResultViewer';
import QueryResultError from 'components/ResponsePane/QueryResult/QueryResultError';

const QueryResultPreview = ({
  previewTab,
  allowedPreviewModes,
  data,
  dataBuffer,
  formattedData,
  error,
  item,
  contentType,
  collection,
  mode,
  disableRunEventListener
}) => {
  const dispatch = useDispatch();

  // Fail safe, so we don't render anything with an invalid tab
  if (!allowedPreviewModes.includes(previewTab)) {
    return null;
  }

  const onRun = () => {
    if (disableRunEventListener) {
      return;
    }
    dispatch(sendRequest(item, collection.uid));
  };

  switch (previewTab) {
    case 'pretty': {
      return <CodeEditor onRun={onRun} value={formattedData} mode={mode} height={'100%'} readOnly />;
    }
    case 'preview-web': {
      const webViewSrc = data.replace('<head>', `<head><base href="${item.requestSent?.url || ''}">`);
      return (
        <webview
          src={`data:text/html; charset=utf-8,${encodeURIComponent(webViewSrc)}`}
          webpreferences="disableDialogs=true, javascript=yes"
          className="h-full bg-white"
        />
      );
    }
    case 'preview-pdf': {
      return <PdfResultViewer dataBuffer={dataBuffer} />;
    }
    case 'preview-image': {
      return <img src={`response-body://${item.uid}`} className="mx-auto" />;
    }
    case 'preview-audio': {
      return <audio controls src={`response-body://${item.uid}`} className="mx-auto" />;
    }
    case 'preview-video': {
      return <video controls src={`response-body://${item.uid}`} className="mx-auto" onErrorCapture={console.error} />;
    }
    case 'error': {
      return <QueryResultError error={error} />;
    }
    default:
    case 'raw': {
      return <CodeEditor onRun={onRun} value={atob(dataBuffer)} mode={mode} height={'100%'} readOnly />;
    }
  }
};

export default QueryResultPreview;
