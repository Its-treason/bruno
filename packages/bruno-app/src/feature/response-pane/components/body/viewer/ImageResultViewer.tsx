/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React from 'react';

type ImageResultViewer = {
  requestId: string;
};

export const ImageResultViewer: React.FC<ImageResultViewer> = ({ requestId }) => {
  return <img src={`response-body://${requestId}`} />;
};
