import { RequestContext } from '../types';

export function determinePreviewType(context: RequestContext) {
  // if the response is a object, it could be json parsable
  const responseBody = context.responseBody;
  if (typeof responseBody !== 'string') {
    context.previewModes = { pretty: 'json', preview: null };
    return;
  }

  const modeByHeader = determinePreviewByHeader(context.response?.headers!);
  if (modeByHeader) {
    context.previewModes = modeByHeader;
    return;
  }

  const modeByBody = determinePreviewByResponseBody(responseBody);
  if (modeByBody) {
    context.previewModes = modeByBody;
    return;
  }
}

function determinePreviewByHeader(
  headers: Record<string, string | string[] | undefined>
): RequestContext['previewModes'] {
  const contentTypes = Object.entries(headers).reduce<string[]>((acc, [name, value]) => {
    if (name.toLowerCase() === 'content-type' && value) {
      return acc.concat(Array.isArray(value) ? value : [value]);
    }
    return acc;
  }, []);

  for (let contentType of contentTypes) {
    contentType = contentType.toLowerCase();

    switch (true) {
      case contentType.includes('application/json'):
      case contentType.includes('application/ld+json'):
        return { pretty: 'json', preview: null };
      case contentType.includes('text/html'):
      case contentType.includes('application/xhtml+xml'):
        return { pretty: 'html', preview: 'html' };
      case contentType.includes('application/xml'):
      case contentType.includes('text/xml'):
        return { pretty: 'xml', preview: null };
      case contentType.includes('text/x-yaml'):
      case contentType.includes('text/yaml'):
      case contentType.includes('text/yml'):
        return { pretty: 'yaml', preview: null };

      case contentType.includes('application/pdf'):
        return { pretty: null, preview: 'pdf' };
      case contentType.includes('image'):
        return { pretty: null, preview: 'image' };
      case contentType.includes('video'):
        return { pretty: null, preview: 'video' };
      case contentType.includes('audio'):
        return { pretty: null, preview: 'audio' };
    }
  }

  return undefined;
}

function determinePreviewByResponseBody(body: string): RequestContext['previewModes'] {
  const magicBytes = Buffer.from(body).subarray(0, 8).toString('hex');

  switch (magicBytes) {
    case '89504e470d0a1a0a': // PNG
    case 'ffd8ff': // PNG
    case '474946383761': // GIF
    case '474946383961': // GIF
      return { pretty: null, preview: 'image' };
    case '1a45df3a':
      return { pretty: null, preview: 'video' };
    case '255044462d': // PDF
      return { pretty: null, preview: 'pdf' };
  }
}
