/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React from 'react';

type ErrorResultViewer = {
  error: Error | string;
};

export const ErrorResultViewer: React.FC<ErrorResultViewer> = ({ error }) => {
  return (
    <div className={'mt-4'}>
      <pre className="text-red-500 break-all whitespace-pre-wrap">{String(error)}</pre>
    </div>
  );
};
