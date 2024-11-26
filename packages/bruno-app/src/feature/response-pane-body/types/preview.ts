/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
export type PreviewType = 'raw' | 'pretty' | 'preview';

// IMPORTANT: PrettyModes must correspond modes of Monaco editor
export type PrettyMode = 'json' | 'html' | 'yaml' | 'xml';

export type PreviewMode = 'audio' | 'video' | 'image' | 'html' | 'pdf';

export type ResponseMode = ['raw', null] | ['error', null] | ['pretty', PrettyMode] | ['preview', PreviewMode];
