/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useStore } from 'zustand';
import { responseStore } from 'src/store/responseStore';
import { Text } from '@mantine/core';
import { useMemo } from 'react';

type ResponseTimeProps = {
  itemUid: string;
};

export const ResponseTime: React.FC<ResponseTimeProps> = ({ itemUid }) => {
  const duration = useStore(responseStore, (state) => state.responses.get(itemUid)?.duration);
  if (duration === undefined) {
    return null;
  }

  const displayDuration = useMemo(() => {
    if (duration < 1000) {
      return `${duration} ms`;
    }

    // duration greater than a second
    const seconds = Math.floor(duration / 1000);
    const decimal = ((duration % 1000) / 1000) * 100;
    return seconds + '.' + decimal.toFixed(0) + ' s';
  }, [duration]);

  return <Text size="sm">{displayDuration}</Text>;
};
