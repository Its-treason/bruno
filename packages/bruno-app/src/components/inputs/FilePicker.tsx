import { Anchor, TextInput, TextInputProps, rem } from '@mantine/core';
import React, { ChangeEvent, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { ShowFileDialogFilter, ShowFileDialogProperties, showOpenDialog } from 'utils/ipcWrapper';

type FilePickerProps = Omit<TextInputProps, 'rightSection' | 'rightSectionPointerEvents' | 'onChange'> & {
  onChange: (change: ChangeEvent | string) => void;
  properties: ShowFileDialogProperties;
  filters: ShowFileDialogFilter[];
};

export const FilePicker: React.FC<FilePickerProps> = (props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onBrowse = useCallback(() => {
    // This will block any user input until the dialog os closes
    showOpenDialog(props.filters, props.properties)
      .then(({ error, filePaths }) => {
        if (filePaths.length > 0) {
          props.onChange(filePaths[0]);
          inputRef.current.value = filePaths[0];
        }
        if (error) {
          toast.error(`Could not browse for directory: ${error}`);
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
      rightSection={
        <Anchor size="sm" onClick={onBrowse}>
          Browse..
        </Anchor>
      }
      rightSectionPointerEvents="all"
      rightSectionWidth={rem(75)}
    />
  );
};
