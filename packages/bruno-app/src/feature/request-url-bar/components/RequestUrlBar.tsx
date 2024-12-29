/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ActionIcon, Button, Indicator, Loader, Paper, Tooltip, rem } from '@mantine/core';
import classes from './RequestUrlBar.module.css';
import { useDispatch } from 'react-redux';
import { saveRequest, sendRequest } from 'providers/ReduxStore/slices/collections/actions';
import { requestUrlChanged, updateRequestMethod } from 'providers/ReduxStore/slices/collections';
import { MethodSelector } from './MethodSelector';
import { get } from 'lodash';
import CodeEditor from 'components/CodeEditor';
import { IconCode, IconDeviceFloppy, IconSend2 } from '@tabler/icons-react';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import NetworkError from 'components/ResponsePane/NetworkError';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { CodeGeneratorModal } from 'src/feature/code-generator';
import { useStore } from 'zustand';
import { responseStore } from 'src/store/responseStore';

type RequestUrlBarProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
};

export const RequestUrlBar: React.FC<RequestUrlBarProps> = ({ collection, item }) => {
  const dispatch = useDispatch();

  const [generateCodeItemModalOpen, setGenerateCodeItemModalOpen] = useState(false);

  const handleRun = async () => {
    // @ts-expect-error TS doesn't get that dispatch returns a promise
    dispatch(sendRequest(item, collection.uid)).catch((err) =>
      toast.custom((t) => <NetworkError onClose={() => toast.dismiss(t.id)} />, {
        duration: 5000
      })
    );
  };

  const onSave = () => {
    dispatch(saveRequest(item.uid, collection.uid));
  };

  const onUrlChange = (value: string) => {
    dispatch(
      requestUrlChanged({
        itemUid: item.uid,
        collectionUid: collection.uid,
        url: value
      })
    );
  };

  const onMethodSelect = (method) => {
    dispatch(
      updateRequestMethod({
        method,
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  };

  const method = item.draft ? get(item, 'draft.request.method') : get(item, 'request.method');
  const url = item.draft ? get(item, 'draft.request.url', '') : get(item, 'request.url', '');

  const isLoading = useStore(responseStore, (state) => {
    const requestState = state.responses.get(item.uid)?.requestState ?? '';
    return requestState === 'queued' || requestState === 'sending';
  });

  return (
    <>
      <CodeGeneratorModal
        opened={generateCodeItemModalOpen}
        onClose={() => setGenerateCodeItemModalOpen(false)}
        collectionUid={collection.uid}
        requestUid={item.uid}
      />

      <Paper className={classes.bar} m={'xs'}>
        <MethodSelector value={method} onChange={onMethodSelect} />

        <CodeEditor singleLine withVariables value={url} onSave={onSave} onChange={onUrlChange} onRun={handleRun} />

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
          <Indicator position="top-start" disabled={!item.draft} offset={8}>
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
