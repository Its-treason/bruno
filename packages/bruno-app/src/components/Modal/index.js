import React, { useEffect, useState } from 'react';
import StyledWrapper from './StyledWrapper';
import { IconAlertTriangle } from '@tabler/icons-react';

const ESC_KEY_CODE = 27;
const ENTER_KEY_CODE = 13;

const ModalHeader = ({ title, handleCancel, customHeader }) => (
  <div className="bruno-modal-header">
    {customHeader ? customHeader : <>{title ? <div className="bruno-modal-header-title">{title}</div> : null}</>}
    {handleCancel ? (
      <div className="close cursor-pointer" onClick={handleCancel ? () => handleCancel() : null}>
        ×
      </div>
    ) : null}
  </div>
);

const ModalContent = ({ children }) => <div className="bruno-modal-content px-4 py-6">{children}</div>;

const ModalFooter = ({
  confirmText,
  cancelText,
  handleSubmit,
  handleCancel,
  confirmDisabled,
  hideCancel,
  hideFooter
}) => {
  confirmText = confirmText || 'Save';
  cancelText = cancelText || 'Cancel';

  if (hideFooter) {
    return null;
  }

  return (
    <div className="flex justify-end p-4 bruno-modal-footer">
      <span className={hideCancel ? 'hidden' : 'mr-2'}>
        <button type="button" onClick={handleCancel} className="btn btn-md btn-close">
          {cancelText}
        </button>
      </span>
      <span>
        <button
          type="submit"
          className="submit btn btn-md btn-secondary"
          disabled={confirmDisabled}
          onClick={handleSubmit}
        >
          {confirmText}
        </button>
      </span>
    </div>
  );
};

const ErrorCallout = ({ message }) => {
  return (
    <div className="mt-4 rounded-md bg-red-50 dark:bg-red-600/10 p-3 ring-1 ring-inset ring-red-400/30">
      <div className="flex">
        <div className="flex">
          <IconAlertTriangle className="h-5 w-5 text-red-400 dark:text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-2 flex-1 md:flex md:justify-between">
          <p className="text-sm text-red-700 dark:text-red-400">{message}</p>
        </div>
      </div>
    </div>
  );
};

const Modal = ({
  size,
  title,
  customHeader,
  confirmText,
  cancelText,
  errorMessage,
  handleCancel,
  handleConfirm,
  children,
  confirmDisabled,
  hideCancel,
  hideFooter,
  disableCloseOnOutsideClick,
  disableEscapeKey,
  onClick,
  closeModalFadeTimeout = 500
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleKeydown = ({ keyCode }) => {
    switch (keyCode) {
      case ESC_KEY_CODE: {
        return closeModal({ type: 'esc' });
      }
      case ENTER_KEY_CODE: {
        if (handleConfirm) {
          return handleConfirm();
        }
      }
    }
  };

  const closeModal = (args) => {
    setIsClosing(true);
    setTimeout(() => handleCancel(args), closeModalFadeTimeout);
  };

  useEffect(() => {
    if (disableEscapeKey) return;
    document.addEventListener('keydown', handleKeydown, false);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [disableEscapeKey, document]);

  let classes = 'bruno-modal';
  if (isClosing) {
    classes += ' modal--animate-out';
  }
  if (hideFooter) {
    classes += ' modal-footer-none';
  }
  return (
    <StyledWrapper className={classes} onClick={onClick ? (e) => onClick(e) : null}>
      <div className={`bruno-modal-card modal-${size}`}>
        <ModalHeader title={title} handleCancel={() => closeModal({ type: 'icon' })} customHeader={customHeader} />
        <ModalContent>
          {children}
          {!!errorMessage ? <ErrorCallout message={errorMessage} /> : null}
        </ModalContent>
        <ModalFooter
          confirmText={confirmText}
          cancelText={cancelText}
          handleCancel={() => closeModal({ type: 'button' })}
          handleSubmit={handleConfirm}
          confirmDisabled={confirmDisabled}
          hideCancel={hideCancel}
          hideFooter={hideFooter}
        />
      </div>

      {/* Clicking on backdrop closes the modal */}
      <div
        className="bruno-modal-backdrop"
        onClick={
          disableCloseOnOutsideClick
            ? null
            : () => {
                closeModal({ type: 'backdrop' });
              }
        }
      />
    </StyledWrapper>
  );
};

export default Modal;
