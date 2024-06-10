/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ComboboxData, Select, SelectProps } from '@mantine/core';
import React from 'react';

const defaultMethod: ComboboxData = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

type MethodSelectorProps = Omit<SelectProps, 'data' | 'styles'> & {
  withBorder?: boolean;
};

export const MethodSelector: React.FC<MethodSelectorProps> = (props) => {
  return (
    <Select
      {...props}
      data={defaultMethod}
      styles={{
        input: {
          border: props.withBorder ? undefined : 'none'
        }
      }}
      allowDeselect={false}
    />
  );
};
