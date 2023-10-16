import CodeEditor from 'components/CodeEditor/index';
import { get } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from 'providers/theme';

const QueryResultPreview = ({
  previewTab,
  allowedPreviewModes,
  data,
  dataBuffer,
  formattedData,
  item,
  contentType,
  collection,
  mode,
  disableRunEventListener,
  storedTheme
}) => {
  const preferences = useSelector((state) => state.app.preferences);
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
    case 'preview-image': {
      return <img src={`data:${contentType.replace(/\;(.*)/, '')};base64,${dataBuffer}`} />;
    }
    default:
    case 'raw': {
      console.log(mode, storedTheme);
      return (
        <CodeEditor
          collection={collection}
          font={get(preferences, 'font.codeFont', 'default')}
          theme={storedTheme}
          onRun={onRun}
          value={formattedData}
          mode={mode}
          readOnly
        />
      );
    }
  }
};

export default QueryResultPreview;
