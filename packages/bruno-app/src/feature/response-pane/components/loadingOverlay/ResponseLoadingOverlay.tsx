/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Overlay } from '@mantine/core';
import { ResponseLoading } from './ResponseLoading';

type ResponseLoadingOverlayProps = {
  requestId: string;
};

export const ResponseLoadingOverlay: React.FC<ResponseLoadingOverlayProps> = ({ requestId }) => {
  return (
    <Overlay backgroundOpacity={0.1} blur={0.5} pt={'xl'}>
      <ResponseLoading requestId={requestId} />
    </Overlay>
  );
};
