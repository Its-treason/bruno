import { ComboboxItem, Select } from '@mantine/core';
import { updateActiveResponseId } from 'providers/ReduxStore/slices/tabs';
import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { responseStore } from 'src/store/responseStore';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

type ResponseHistoryProps = {
  itemUid: string;
  selectedResponseUid?: string;
};

export const ResponseHistory: React.FC<ResponseHistoryProps> = ({ itemUid, selectedResponseUid }) => {
  const dispatch = useDispatch();

  const responseList = useStore(responseStore, (state) => state.requestResponses.get(itemUid)) ?? [];
  useEffect(() => {
    if (responseList.length === 0) {
      return;
    }

    dispatch(
      updateActiveResponseId({
        uid: itemUid,
        requestId: responseList.at(-1)
      })
    );
  }, [responseList, dispatch]);

  const responses = useStore(
    responseStore,
    useShallow((state) => {
      return responseList.map((requestId) => state.responses.get(requestId)).filter(Boolean);
    })
  );

  // TODO: Refactor to combobox with custom render stuff
  const data: ComboboxItem[] = useMemo(() => {
    return responses.map((response) => ({
      value: response.requestId,
      label: `${new Date(response.requestSentTimestamp).toLocaleString()}`
    }));
  }, [responses]);

  if (responseList.length === 0) {
    return null;
  }

  return (
    <Select
      size="xs"
      w={250}
      value={selectedResponseUid}
      data={data}
      onChange={(value) => {
        dispatch(
          updateActiveResponseId({
            requestId: value,
            uid: itemUid
          })
        );
      }}
    />
  );
};
