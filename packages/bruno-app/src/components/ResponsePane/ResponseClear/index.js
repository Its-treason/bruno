import { IconEraser } from '@tabler/icons-react';
import StyledWrapper from './StyledWrapper';
import { responseStore } from 'src/store/responseStore';

const ResponseClear = ({ itemUid }) => {
  const clearResponse = () => {
    responseStore.getState().clearResponse(itemUid);
  };

  return (
    <StyledWrapper className="flex items-center">
      <button onClick={clearResponse} title="Clear response">
        <IconEraser size={16} strokeWidth={1.5} />
      </button>
    </StyledWrapper>
  );
};

export default ResponseClear;
