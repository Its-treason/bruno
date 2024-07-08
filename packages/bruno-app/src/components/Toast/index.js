import { useEffect } from 'react';
import StyledWrapper from './StyledWrapper';
import { IconX } from '@tabler/icons-react';

const ToastContent = ({ type, text, handleClose }) => (
  <div className={`alert alert-${type}`} role="alert">
    <div> {text} </div>
    <div onClick={handleClose} className="closeToast">
      <IconX />
    </div>
  </div>
);

const Toast = ({ text, type, duration, handleClose }) => {
  let lifetime = duration ? duration : 3000;

  useEffect(() => {
    if (text) {
      setTimeout(handleClose, lifetime);
    }
  }, [text]);

  return (
    <StyledWrapper className="bruno-toast">
      <div className="bruno-toast-card">
        <ToastContent type={type} text={text} handleClose={handleClose}></ToastContent>
      </div>
    </StyledWrapper>
  );
};

export default Toast;
