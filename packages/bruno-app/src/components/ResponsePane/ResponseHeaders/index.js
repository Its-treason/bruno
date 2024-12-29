import { useStore } from 'zustand';
import StyledWrapper from './StyledWrapper';
import { responseStore } from 'src/store/responseStore';
import { useShallow } from 'zustand/react/shallow';
import { useMemo } from 'react';

const ResponseHeaders = ({ itemUid }) => {
  const headersArray = useStore(
    responseStore,
    useShallow((state) => {
      return state.responses.get(itemUid)?.headers;
    })
  );

  const rows = useMemo(() => {
    return Object.entries(headersArray ?? {}).map(([name, value], index) => {
      return (
        <tr key={index}>
          <td className="key">{name}</td>
          <td className="value">{value}</td>
        </tr>
      );
    });
  });

  return (
    <StyledWrapper className="w-full">
      <table>
        <thead>
          <tr>
            <td>Name</td>
            <td>Value</td>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </StyledWrapper>
  );
};
export default ResponseHeaders;
