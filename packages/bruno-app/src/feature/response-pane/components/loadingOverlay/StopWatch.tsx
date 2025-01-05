import { Text } from '@mantine/core';
import React, { useEffect, useRef } from 'react';

function formatStopwatchTimestamp(timestamp: number) {
  if (timestamp < 200 || isNaN(timestamp)) {
    return 'Loading...';
  }
  return `${(timestamp / 1000).toFixed(1)}s`;
}

type StopWatchProps = {
  requestTimestamp?: number;
};

export const StopWatch: React.FC<StopWatchProps> = ({ requestTimestamp }) => {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.innerText = formatStopwatchTimestamp(Date.now() - requestTimestamp);
    const interval = setInterval(() => {
      if (!ref.current) {
        return;
      }
      ref.current.innerText = formatStopwatchTimestamp(Date.now() - requestTimestamp);
    }, 100);
    return () => {
      return clearInterval(interval);
    };
  }, [requestTimestamp]);

  return <Text size="lg" ref={ref} />;
};
