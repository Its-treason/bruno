import { useStore } from 'zustand';
import StyledWrapper from './StyledWrapper';
import { responseStore } from 'src/store/responseStore';

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const ResponseSize = ({ itemUid }) => {
  const size = useStore(responseStore, (state) => state.responses.get(itemUid)?.size ?? 0);

  const formatted = formatBytes(size);

  return <StyledWrapper title={`${size} bytes`}>{formatted}</StyledWrapper>;
};
export default ResponseSize;
