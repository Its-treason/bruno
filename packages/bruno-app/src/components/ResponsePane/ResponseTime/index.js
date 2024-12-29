import StyledWrapper from './StyledWrapper';
import { useStore } from 'zustand';
import { responseStore } from 'src/store/responseStore';

const ResponseTime = ({ itemUid }) => {
  const duration = useStore(responseStore, (state) => state.responses.get(itemUid)?.duration);

  let durationToDisplay = `${duration} ms`;
  if (duration > 1000) {
    // duration greater than a second
    const seconds = Math.floor(duration / 1000);
    const decimal = ((duration % 1000) / 1000) * 100;
    durationToDisplay = seconds + '.' + decimal.toFixed(0) + ' s';
  }

  return <StyledWrapper>{durationToDisplay}</StyledWrapper>;
};
export default ResponseTime;
