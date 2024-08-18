import React, { MouseEvent as ReactMouseEvent, ReactNode, useEffect, useRef, useState } from 'react';
import classes from './RequestPaneSplit.module.scss';

type ReactPaneSplitProps = {
  left: ReactNode;
  right: ReactNode;
};

export const RequestPaneSplit: React.FC<ReactPaneSplitProps> = ({ left, right }) => {
  const [splitting, setSplitting] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setSplitting(true);
  };

  const handleMouseUp = () => {
    setSplitting(false);
  };

  const handleMouseMove = (evt: MouseEvent) => {
    if (splitting && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = evt.clientX - containerRect.left;
      const newSplitPosition = (mouseX / containerWidth) * 100;

      // Ensure each side is at least 300px wide
      const minSplitPosition = (350 / containerWidth) * 100;
      const maxSplitPosition = 100 - minSplitPosition;

      setSplitPosition(Math.max(minSplitPosition, Math.min(newSplitPosition, maxSplitPosition)));
    }
  };

  useEffect(() => {
    if (splitting) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [splitting]);

  return (
    <div className={classes.wrapper} ref={containerRef}>
      <div className={classes.pane} style={{ width: `${splitPosition}%` }}>
        {left}
      </div>
      <div className={classes.split} onMouseDown={handleMouseDown} />
      <div className={classes.pane} style={{ width: `${100 - splitPosition}%` }}>
        {right}
      </div>
    </div>
  );
};
