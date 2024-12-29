import statusCodePhraseMap from './get-status-code-phrase';
import { useStore } from 'zustand';
import { responseStore } from 'src/store/responseStore';
import { MantineColor, Text } from '@mantine/core';
import React, { useMemo } from 'react';

type StatusCodeProps = {
  itemUid: string;
};

export const StatusCode: React.FC<StatusCodeProps> = ({ itemUid }) => {
  const status = useStore(responseStore, (state) => state.responses.get(itemUid)?.status);

  const color = useMemo<MantineColor>(() => {
    if (status >= 200 && status < 300) {
      return 'green';
    } else if (status >= 400 && status < 500) {
      return 'orange';
    } else if (status >= 500 && status < 600) {
      return 'red';
    }
    return 'dark';
  }, [status]);

  return (
    <Text c={color}>
      {status} {statusCodePhraseMap[status]}
    </Text>
  );
};
