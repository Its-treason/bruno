import React from 'react';
import StyledWrapper from './StyledWrapper';

const ResponseTime = ({ duration }) => {
  let durationToDisplay = '';

  if (duration > 1000) {
    // duration greater than a second
    let seconds = Math.floor(duration / 1000);
    let decimal = ((duration % 1000) / 1000) * 100;
    durationToDisplay = seconds + '.' + decimal.toFixed(0) + 's';
  } else {
    durationToDisplay = duration + 'ms';
  }

  return <StyledWrapper>{durationToDisplay}</StyledWrapper>;
};
export default ResponseTime;
