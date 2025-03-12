/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useStore } from 'zustand';
import { responseStore } from 'src/store/responseStore';
import { Text } from '@mantine/core';
import { useMemo } from 'react';
import { formatMilliseconds } from 'utils/common/formatting';

type ResponseTimeProps = {
  requestId: string;
};

export const ResponseTime: React.FC<ResponseTimeProps> = ({ requestId }) => {
  const duration = useStore(responseStore, (state) => state.responses.get(requestId)?.duration);
  if (duration === undefined) {
    return null;
  }

  const displayDuration = useMemo(() => formatMilliseconds(duration), [duration]);

  return <Text size="sm">{displayDuration}</Text>;
};
