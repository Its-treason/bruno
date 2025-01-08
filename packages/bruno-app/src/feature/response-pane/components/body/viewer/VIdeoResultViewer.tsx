/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React from 'react';

type VideoResultViewer = {
  requestId: string;
};

export const VideoResultViewer: React.FC<VideoResultViewer> = ({ requestId }) => {
  return <audio controls src={`response-body://${requestId}`} />;
};
