import React from 'react';
import StyledWrapper from './StyledWrapper';
import toast from 'react-hot-toast';
import get from 'lodash/get';
import { IconDownload } from '@tabler/icons-react';

const ResponseSave = ({ item, size }) => {
  const { ipcRenderer } = window;

  const saveResponseToFile = () => {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('renderer:save-response-to-file', item.uid, item.response, item.requestSent.url)
        .then(resolve)
        .catch((err) => {
          toast.error(get(err, 'error.message') || 'Something went wrong!');
          reject(err);
        });
    });
  };

  return (
    <StyledWrapper className="flex items-center">
      <button
        onClick={saveResponseToFile}
        disabled={size === 0}
        title="Save response to file"
        className={size === 0 ? 'cursor-not-allowed' : 'curser-pointer'}
      >
        <IconDownload size={16} strokeWidth={1.5} />
      </button>
    </StyledWrapper>
  );
};
export default ResponseSave;
