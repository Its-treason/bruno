/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { ActionIcon, Indicator, Paper, Tooltip, rem } from '@mantine/core';
import classes from './RequestUrlBar.module.css';
import { useDispatch } from 'react-redux';
import { saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import { requestUrlChanged } from 'providers/ReduxStore/slices/collections';
import { MethodSelector } from './MethodSelector';
import { get } from 'lodash';
import CodeEditor from 'components/CodeEditor';
import { IconArrowRight, IconDeviceFloppy } from '@tabler/icons-react';

type Request = {
  uid: string;
  method: string;
  url: string;

  draft?: Request;
};

type RequestUrlBarProps = {
  item: Request;
  collection: { uid: string };
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

  const method = item.draft ? get(item, 'draft.request.method') : get(item, 'request.method');
  const url = item.draft ? get(item, 'draft.request.url', '') : get(item, 'request.url', '');

  return (
    <Paper className={classes.bar} m={'xs'}>
      <MethodSelector collectionUid={collection.uid} requestUid={item.uid} selectedMethod={method} />

      <CodeEditor
        singleLine
        withVariables
        value={url}
        onSave={onSave}
        onChange={onUrlChange}
        onRun={handleRun}
        collection={collection}
      />

      <Tooltip label={'Save'}>
        <Indicator position="top-start" disabled={!item.draft} offset={8}>
          <ActionIcon onClick={onSave} size={'input-sm'} variant="transparent" c={'gray'}>
            <IconDeviceFloppy style={{ width: rem(32) }} stroke={1.5} />
          </ActionIcon>
        </Indicator>
      </Tooltip>

      <Tooltip label={'Send request'}>
        <ActionIcon onClick={handleRun} size={'input-sm'}>
          <IconArrowRight style={{ width: rem(32) }} stroke={1.5} />
        </ActionIcon>
      </Tooltip>
    </Paper>
  );
};
