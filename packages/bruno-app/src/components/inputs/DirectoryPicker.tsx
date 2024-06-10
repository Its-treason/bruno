import { Anchor, TextInput, TextInputProps, rem } from '@mantine/core';
import React, { ChangeEvent, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

type DirectoryPickerProps = Omit<TextInputProps, 'rightSection' | 'rightSectionPointerEvents' | 'onChange'> & {
  onChange: (change: ChangeEvent | string) => void;
};

export const DirectoryPicker: React.FC<DirectoryPickerProps> = (props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onBrowse = useCallback(() => {
    // This will block any user input until the dialog os closes
    // @ts-expect-error
    window.ipcRenderer
      .invoke('renderer:browse-directory')
      .then((selectedPath: unknown) => {
        if (typeof selectedPath === 'string' && props.onChange) {
          props.onChange(selectedPath);
          inputRef.current.value = selectedPath;
        }
      })
      .catch((error: unknown) => {
        toast.error(`Could not browse for directory: ${error}`);
      });
  }, [inputRef, props.onChange]);

  return (
    <TextInput
      {...props}
      ref={inputRef}
      rightSection={<Anchor onClick={onBrowse}>Browse</Anchor>}
      rightSectionPointerEvents="all"
      rightSectionWidth={rem(75)}
    />
  );
};
