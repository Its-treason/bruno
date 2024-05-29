/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ComboboxData, Select } from '@mantine/core';
import { updateRequestMethod } from 'providers/ReduxStore/slices/collections';
import React from 'react';
import { useDispatch } from 'react-redux';

const defaultMethod: ComboboxData = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

type MethodSelectorProps = {
  requestUid: string;
  collectionUid: string;
  selectedMethod: string;
};

export const MethodSelector: React.FC<MethodSelectorProps> = ({ collectionUid, requestUid, selectedMethod }) => {
  const dispatch = useDispatch();

  const onMethodSelect = (method) => {
    dispatch(
      updateRequestMethod({
        method,
        itemUid: requestUid,
        collectionUid: collectionUid
      })
    );
  };

  return (
    <Select
      value={selectedMethod}
      onChange={onMethodSelect}
      data={defaultMethod}
      styles={{
        input: {
          border: 'none'
        }
      }}
    />
  );
};
