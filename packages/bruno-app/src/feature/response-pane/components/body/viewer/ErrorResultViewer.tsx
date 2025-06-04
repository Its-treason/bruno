/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import CodeEditor from 'components/CodeEditor';
import React from 'react';

type ErrorResultViewer = {
  error: Error | string;
};

export const ErrorResultViewer: React.FC<ErrorResultViewer> = ({ error }) => {
  return <CodeEditor value={String(error)} mode={'text'} height={'100%'} readOnly />;
};
