/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React from 'react';

type AudioResultViewer = {
  requestId: string;
};

export const AudioResultViewer: React.FC<AudioResultViewer> = ({ requestId }) => {
  return <audio controls src={`response-body://${requestId}`} />;
};
