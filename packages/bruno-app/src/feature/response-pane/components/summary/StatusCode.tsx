/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useStore } from 'zustand';
import { responseStore } from 'src/store/responseStore';
import { MantineColor, Text } from '@mantine/core';
import React, { useMemo } from 'react';
import { statusCodePhraseMap } from 'utils/common/statusCodePhraseMap';

type StatusCodeProps = {
  requestId: string;
};

export const StatusCode: React.FC<StatusCodeProps> = ({ requestId }) => {
  const status = useStore(responseStore, (state) => state.responses.get(requestId)?.status);
  if (status === undefined) {
    return null;
  }

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
    <Text c={color} size="sm">
      {status} {statusCodePhraseMap[status]}
    </Text>
  );
};
