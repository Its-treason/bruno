/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Text } from '@mantine/core';
import React from 'react';
import { responseStore } from 'src/store/responseStore';
import { useStore } from 'zustand';

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

type ResponseSizeProps = {
  requestId: string;
};

export const ResponseSize: React.FC<ResponseSizeProps> = ({ requestId }) => {
  const size = useStore(responseStore, (state) => state.responses.get(requestId)?.size);
  if (size === undefined) {
    return null;
  }

  const formatted = formatBytes(size);

  return <Text size="sm">{formatted}</Text>;
};
