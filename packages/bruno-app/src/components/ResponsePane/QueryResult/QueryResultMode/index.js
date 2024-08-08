import { getContentType, safeParseXML, safeStringifyJSON } from 'utils/common';
import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import StyledWrapper from 'components/ResponsePane/QueryResult/QueryResultMode/StyledWrapper';
import QueryResultPreview from 'components/ResponsePane/QueryResult/QueryResultViewer';
import QueryResultFilter from 'components/ResponsePane/QueryResult/QueryResultFilter';
import { JSONPath } from 'jsonpath-plus';

export const getMonacoModeFromContent = (contentType, body) => {
  if (typeof body === 'object') {
    return 'application/ld+json';
  }
  if (!contentType || typeof contentType !== 'string') {
    return 'application/text';
  }

  if (contentType.includes('json')) {
    return 'application/ld+json';
  } else if (contentType.includes('xml')) {
    return 'application/xml';
  } else if (contentType.includes('html')) {
    return 'application/html';
  } else if (contentType.includes('text')) {
    return 'application/text';
  } else if (contentType.includes('application/edn')) {
    return 'application/xml';
  } else if (contentType.includes('yaml')) {
    return 'application/yaml';
  } else if (contentType.includes('image')) {
    return 'application/image';
  } else {
    return 'application/text';
  }
};

/**
 * @param {string|object|undefined} data
 * @param {string} mode
 * @param {string} filter
 * @returns {string}
 */
const formatResponse = (data, mode, filter) => {
  if (data === undefined) {
    return '';
  }

  if (mode.includes('json')) {
    if (filter) {
      try {
        data = JSONPath({ path: filter, json: data });
      } catch (e) {
        console.warn('Could not filter with JSONPath.', e.message);
      }
    }

    return safeStringifyJSON(data, true);
  }

  if (mode.includes('xml')) {
    let parsed = safeParseXML(data, { collapseContent: true });
    if (typeof parsed === 'string') {
      return parsed;
    }

    return safeStringifyJSON(parsed, true);
  }

  if (typeof data === 'string') {
    return data;
  }

  return safeStringifyJSON(data);
};

const QueryResultMode = ({ item, collection, data, dataBuffer, width, disableRunEventListener, headers, error }) => {
  const contentType = getContentType(headers);
  const mode = getMonacoModeFromContent(contentType, data);
  const [filter, setFilter] = useState('');
  const formattedData = formatResponse(data, mode, filter);

  const allowedPreviewModes = useMemo(() => {
    // Always show raw
    const allowedPreviewModes = ['raw'];

    if (formattedData !== atob(dataBuffer) && formattedData !== '') {
      allowedPreviewModes.unshift('pretty');
    }

    if (mode.includes('html') && typeof data === 'string') {
      allowedPreviewModes.unshift('preview-web');
    } else if (mode.includes('image')) {
      allowedPreviewModes.unshift('preview-image');
    } else if (contentType.includes('pdf')) {
      allowedPreviewModes.unshift('preview-pdf');
    } else if (contentType.includes('audio')) {
      allowedPreviewModes.unshift('preview-audio');
    } else if (contentType.includes('video')) {
      allowedPreviewModes.unshift('preview-video');
    }

    if (error) {
      allowedPreviewModes.unshift('error');
    }

    return allowedPreviewModes;
  }, [mode, data, formattedData]);

  const [previewTab, setPreviewTab] = useState(allowedPreviewModes[0]);
  // Ensure the active Tab is always allowed
  useEffect(() => {
    if (!allowedPreviewModes.includes(previewTab)) {
      setPreviewTab(allowedPreviewModes[0]);
    }
  }, [previewTab, allowedPreviewModes]);

  const tabs = useMemo(() => {
    if (allowedPreviewModes.length === 1) {
      return null;
    }

    return allowedPreviewModes.map((previewMode) => (
      <div
        className={classnames('select-none capitalize', previewMode === previewTab ? 'active' : 'cursor-pointer')}
        role="tab"
        onClick={() => setPreviewTab(previewMode)}
        key={previewMode}
      >
        {previewMode.replace(/-(.*)/, ' ')}
      </div>
    ));
  }, [allowedPreviewModes, previewTab]);

  const queryFilterEnabled = useMemo(() => mode.includes('json'), [mode]);

  return (
    <StyledWrapper
      className="w-full h-full relative"
      style={{ maxWidth: width }}
      queryFilterEnabled={queryFilterEnabled}
    >
      <div className="flex justify-end gap-2 text-xs" role="tablist">
        {tabs}
      </div>
      <QueryResultPreview
        previewTab={previewTab}
        data={data}
        dataBuffer={dataBuffer}
        formattedData={formattedData}
        error={error}
        item={item}
        contentType={contentType}
        mode={mode}
        collection={collection}
        allowedPreviewModes={allowedPreviewModes}
        disableRunEventListener={disableRunEventListener}
      />
      {queryFilterEnabled && <QueryResultFilter onChange={setFilter} mode={mode} />}
    </StyledWrapper>
  );
};

export default QueryResultMode;
