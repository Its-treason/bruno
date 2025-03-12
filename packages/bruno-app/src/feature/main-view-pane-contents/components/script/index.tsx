import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import CodeEditor from 'components/CodeEditor';
import { updateRequestScript, updateResponseScript } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import { ActionIcon, Group, Text } from '@mantine/core';
import classes from './Script.module.scss';
import React, { useState } from 'react';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { IconZoomIn, IconZoomOut } from '@tabler/icons-react';

type ScriptProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
};

export const Script: React.FC<ScriptProps> = ({ item, collection }) => {
  const dispatch = useDispatch();
  const requestScript = item.draft ? get(item, 'draft.request.script.req') : get(item, 'request.script.req');
  const responseScript = item.draft ? get(item, 'draft.request.script.res') : get(item, 'request.script.res');

  const [zoomIn, setZoomIn] = useState<null | 'pre' | 'post'>(null);

  const onRequestScriptEdit = (value) => {
    dispatch(
      updateRequestScript({
        script: value,
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  };

  const onResponseScriptEdit = (value) => {
    dispatch(
      updateResponseScript({
        script: value,
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  };

  const onRun = () => dispatch(sendRequest(item, collection.uid));
  const onSave = () => dispatch(saveRequest(item.uid, collection.uid));

  return (
    <div className={classes.container} data-pre-zoom-on={zoomIn === 'pre'} data-post-zoom-on={zoomIn === 'post'}>
      <div>
        <Group justify="space-between">
          <Text size="lg">Pre Request</Text>
          <ActionIcon
            variant={'default'}
            onClick={() => setZoomIn(zoomIn === 'pre' ? null : 'pre')}
            aria-label={'Increase pre request script size'}
          >
            {zoomIn === 'pre' ? <IconZoomOut size={18} stroke={1.5} /> : <IconZoomIn size={18} stroke={1.5} />}
          </ActionIcon>
        </Group>
        <CodeEditor
          value={requestScript || ''}
          height={'100%'}
          onChange={onRequestScriptEdit}
          mode="javascript"
          onRun={onRun}
          onSave={onSave}
          extraLibs={['bru', 'req', 'res']}
        />
      </div>
      <div>
        <Group justify="space-between">
          <Text size="lg">Post Request</Text>
          <ActionIcon
            variant={'default'}
            onClick={() => setZoomIn(zoomIn === 'post' ? null : 'post')}
            aria-label={'Increase post request script size'}
          >
            {zoomIn === 'post' ? <IconZoomOut size={18} stroke={1.5} /> : <IconZoomIn size={18} stroke={1.5} />}
          </ActionIcon>
        </Group>
        <CodeEditor
          value={responseScript || ''}
          height={'100%'}
          onChange={onResponseScriptEdit}
          mode="javascript"
          onRun={onRun}
          onSave={onSave}
          extraLibs={['bru', 'req', 'res']}
        />
      </div>
    </div>
  );
};
