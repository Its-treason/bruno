import React, { MouseEvent as ReactMouseEvent, ReactNode, useEffect, useRef, useState } from 'react';
import classes from './RequestPaneSplit.module.scss';
import { useStore } from 'zustand';
import { appStore } from 'src/store/appStore';

type ReactPaneSplitProps = {
  left: ReactNode;
  right: ReactNode;
};

export const RequestPaneSplit: React.FC<ReactPaneSplitProps> = ({ left, right }) => {
  const horizontalLayout = useStore(appStore, (store) => store.preferences.display.horizontalLayout);

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
      const containerSize = horizontalLayout ? containerRect.height : containerRect.width;
      const mousePosition = horizontalLayout ? evt.clientY - containerRect.top : evt.clientX - containerRect.left;
      const newSplitPosition = (mousePosition / containerSize) * 100;

      // Ensure each side is at least 350px
      const minSize = horizontalLayout ? 200 : 350;
      const minSplitPosition = (minSize / containerSize) * 100;
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

  const key = horizontalLayout ? 'height' : 'width';

  return (
    <div className={classes.wrapper} ref={containerRef} data-horizontal={horizontalLayout}>
      <div className={classes.pane} style={{ [key]: `${splitPosition}%` }}>
        {left}
      </div>
      <div className={classes.split} onMouseDown={handleMouseDown} />
      <div className={classes.pane} style={{ [key]: `${100 - splitPosition}%` }}>
        {right}
      </div>
    </div>
  );
};
