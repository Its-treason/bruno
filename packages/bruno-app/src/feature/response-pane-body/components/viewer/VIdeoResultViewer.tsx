/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React from 'react';

type VideoResultViewer = {
  itemId: string;
};

export const VideoResultViewer: React.FC<VideoResultViewer> = ({ itemId }) => {
  return <audio controls src={`response-body://${itemId}`} />;
};
