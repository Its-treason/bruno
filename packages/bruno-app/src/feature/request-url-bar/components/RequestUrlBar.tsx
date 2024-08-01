/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ActionIcon, Button, Indicator, Loader, Paper, Tooltip, rem } from '@mantine/core';
import classes from './RequestUrlBar.module.css';
import { useDispatch } from 'react-redux';
import { saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import { requestUrlChanged, updateRequestMethod } from 'providers/ReduxStore/slices/collections';
import { MethodSelector } from './MethodSelector';
import { get } from 'lodash';
import CodeEditor from 'components/CodeEditor';
import { IconDeviceFloppy, IconSend2 } from '@tabler/icons-react';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';

type RequestUrlBarProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
  handleRun: () => void;
};

export const RequestUrlBar: React.FC<RequestUrlBarProps> = ({ collection, item, handleRun }) => {
  const dispatch = useDispatch();

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

  const isLoading = ['queued', 'sending'].includes(item.requestState);

  return (
    <Paper className={classes.bar} m={'xs'}>
      <MethodSelector value={method} onChange={onMethodSelect} />

      <CodeEditor singleLine withVariables value={url} onSave={onSave} onChange={onUrlChange} onRun={handleRun} />

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
  );
};
