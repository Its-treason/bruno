import React, { useEffect, useRef } from 'react';

function formatStopwatchTimestamp(timestamp) {
  if (timestamp < 200) {
    return 'Loading...';
  }
  return `${(timestamp / 1000).toFixed(1)}s`;
}

type StopWatchProps = {
  requestTimestamp: number;
};

export const StopWatch: React.FC<StopWatchProps> = ({ requestTimestamp }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.innerText = formatStopwatchTimestamp(Date.now() - requestTimestamp);
    const interval = setInterval(() => {
      ref.current.innerText = formatStopwatchTimestamp(Date.now() - requestTimestamp);
    }, 100);
    return () => {
      return clearInterval(interval);
    };
  }, [requestTimestamp]);

  return <span ref={ref} />;
};
