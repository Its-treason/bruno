/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { editor, Range } from 'monaco-editor';

export function flattenVariables(obj: any, prefix: string = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      return [...acc, ...flattenVariables(obj[key], newKey)];
    } else {
      return [...acc, [newKey, obj[key]]];
    }
  }, []);
}

export function highlightSpecificWords(editor: editor.IStandaloneCodeEditor, wordsToHighlight: Record<string, string>) {
  const model = editor.getModel();
  const text = model.getValue();
  const decorations: { range: Range; options: editor.IModelDecorationOptions }[] = [];

  const regex = /{{[$\w-\.]+}}/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const startPosition = model.getPositionAt(match.index);
    const endPosition = model.getPositionAt(match.index + match[0].length);

    let inlineClassName = 'brunoPlaceholderHighlightInvalid';
    let hoverMessage = { value: '**Variable not found**', trusted: true };

    const value = wordsToHighlight[match[0].slice(2, -2)];
    if (value) {
      inlineClassName = 'brunoPlaceholderHighlightValid';
      hoverMessage = { value, trusted: false };
    }

    decorations.push({
      range: new Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column),
      options: {
        inlineClassName,
        hoverMessage
      }
    });
  }

  return editor.createDecorationsCollection(decorations);
}
