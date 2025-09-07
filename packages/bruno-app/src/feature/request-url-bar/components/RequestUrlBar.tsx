/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ActionIcon, Button, Indicator, Loader, Paper, Tooltip, rem } from '@mantine/core';
import classes from './RequestUrlBar.module.css';
import { useDispatch } from 'react-redux';
import { sendRequest } from 'providers/ReduxStore/slices/collections/actions';
import { MethodSelector } from './MethodSelector';
import CodeEditor from 'components/CodeEditor';
import { IconCode, IconDeviceFloppy, IconSend2 } from '@tabler/icons-react';
import { CollectionSchema } from '@usebruno/schema';
import { useState } from 'react';
import { CodeGeneratorModal } from 'src/feature/code-generator';
import { useStore } from 'zustand';
import { responseStore } from 'src/store/responseStore';
import { collectionStore, useRequestItem } from 'src/store/collectionStore';
import { saveRequest } from 'src/common/collection';

type RequestUrlBarProps = {
  // itemId: string;
  collection: CollectionSchema;
};

export const RequestUrlBar: React.FC<RequestUrlBarProps> = ({ collection }) => {
  const itemId = 'BP051';
  const dispatch = useDispatch();

  const [generateCodeItemModalOpen, setGenerateCodeItemModalOpen] = useState(false);

  const item = useRequestItem(itemId);
  const hasDraft = useStore(collectionStore, (state) => state.draftItems.has(itemId));

  const handleRun = async () => {
    dispatch(sendRequest(item, collection.uid));
  };

  const onSave = () => {
    saveRequest(itemId);
  };

  const onUrlChange = (url: string) => {
    collectionStore.getState().updateRequestItem(itemId, (draft) => {
      draft.http.url = url;
    });
  };

  const onMethodSelect = (method: string) => {
    collectionStore.getState().updateRequestItem(itemId, (draft) => {
      draft.http.method = method.toLowerCase();
    });
  };

  const isLoading = useStore(responseStore, (state) => {
    const requestState = state.responses.get(itemId)?.requestState ?? '';
    return requestState === 'queued' || requestState === 'sending';
  });

  return (
    <>
      <CodeGeneratorModal
        opened={generateCodeItemModalOpen}
        onClose={() => setGenerateCodeItemModalOpen(false)}
        collectionUid={collection.uid}
        requestUid={itemId}
      />

      <Paper className={classes.bar} m={'xs'}>
        <MethodSelector value={item.data.http.method.toUpperCase()} onChange={onMethodSelect} />

        <CodeEditor
          singleLine
          withVariables
          value={item.data.http.url}
          onSave={onSave}
          onChange={onUrlChange}
          onRun={handleRun}
        />

        <Tooltip label={'Generate code'}>
          <ActionIcon
            onClick={() => setGenerateCodeItemModalOpen(true)}
            size={'input-sm'}
            variant="transparent"
            c={'gray'}
          >
            <IconCode style={{ width: rem(32) }} stroke={1.5} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label={'Save request'}>
          <Indicator position="top-start" disabled={!hasDraft} offset={8}>
            <ActionIcon onClick={onSave} size={'input-sm'} variant="transparent" c={'gray'}>
              <IconDeviceFloppy style={{ width: rem(32) }} stroke={1.5} />
            </ActionIcon>
          </Indicator>
        </Tooltip>

        <Button
          size="input-sm"
          rightSection={
            isLoading ? (
              <Loader style={{ width: rem(32), marginRight: 'calc(var(--button-padding-x-sm) / 2)' }} size={'xs'} />
            ) : (
              <IconSend2 style={{ width: rem(32), marginRight: 'calc(var(--button-padding-x-sm) / 2)' }} stroke={1.5} />
            )
          }
          onClick={handleRun}
          variant="filled"
          disabled={isLoading}
        >
          Send
        </Button>
      </Paper>
    </>
  );
};
