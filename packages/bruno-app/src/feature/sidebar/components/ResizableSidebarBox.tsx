/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { MouseEventHandler, ReactElement, useCallback, useRef } from 'react';
import classes from './ResizableSidebarBox.module.scss';

type ResizableSidebarBoxProps = {
  children: [ReactElement, ReactElement, ReactElement];
};

export const ResizableSidebarBox: React.FC<ResizableSidebarBoxProps> = ({ children }) => {
  const aside = useRef<HTMLElement>(null);

  const onDragStart: MouseEventHandler<HTMLDivElement> = useCallback((evt) => {
    evt.preventDefault(); // This prevents text select

    const mouseMoveListener = (evt: MouseEvent) => {
      if (!aside.current) {
        return;
      }
      aside.current.style.width = `${evt.clientX}px`;
      aside.current.dataset.dragging = 'true';
    };
    document.addEventListener('mousemove', mouseMoveListener);

    const dragEndListener = () => {
      document.removeEventListener('mousemove', mouseMoveListener);
      document.removeEventListener('mouseup', dragEndListener);
      if (aside.current) {
        aside.current.dataset.dragging = 'false';
      }
    };
    document.addEventListener('mouseup', dragEndListener);
  }, []);

  return (
    <aside className={classes.aside} ref={aside}>
      <div onMouseDown={onDragStart} className={classes.resizable} />

      {children}
    </aside>
  );
};
