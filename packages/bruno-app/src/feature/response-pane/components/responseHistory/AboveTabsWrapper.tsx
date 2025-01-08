import React, { ReactNode } from 'react';
import classes from './AboveTabsWrapper.module.scss';

type AboveTabsWrapper = {
  summary: ReactNode;
  history: ReactNode;
};

export const AboveTabsWrapper: React.FC<AboveTabsWrapper> = ({ summary, history }) => {
  return (
    <div className={classes.wrapper}>
      {summary} {history}
    </div>
  );
};
