import React from 'react';
import StyledWrapper from './StyledWrapper';
import toast from 'react-hot-toast';
import get from 'lodash/get';
import { IconDownload } from '@tabler/icons-react';
import { responseStore } from 'src/store/responseStore';
import { useStore } from 'zustand';

const ResponseSave = ({ itemUid }) => {
  const size = useStore(responseStore, (state) => state.responses.get(itemUid)?.size ?? 0);

  const saveResponseToFile = () => {
    const { headers, timeline } = responseStore.getState().responses.get(itemUid);

    const options = timeline.at(0).finalOptions;
    const url = `${options.protocol}//${options.hostname}${options.path}`;

    return new Promise((resolve, reject) => {
      window.ipcRenderer
        .invoke('renderer:save-response-to-file', item.uid, headers, url)
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
