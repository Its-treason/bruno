/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useQuery } from '@tanstack/react-query';
import { RequestItemSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import { sendRequest } from 'providers/ReduxStore/slices/collections/actions';
import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ActionIcon, TextInput } from '@mantine/core';
import classes from './JsonFilterResultViewer.module.scss';
import { IconFilter } from '@tabler/icons-react';
import { useDebouncedState } from '@mantine/hooks';
import { parse, stringify } from 'lossless-json';
import { JSONPath } from 'jsonpath-plus';

type JsonFilterResultViewerProps = {
  item: RequestItemSchema;
  requestId: string;
  collectionUid: string;
  disableRun: boolean;
};

export const JsonFilterResultViewer: React.FC<JsonFilterResultViewerProps> = ({
  collectionUid,
  item,
  requestId,
  disableRun
}) => {
  const dispatch = useDispatch();
  const [filter, setFilter] = useDebouncedState('', 200);
  const [filterOpened, setFilterOpened] = useState(false);

  const onRun = useCallback(() => {
    if (!disableRun) {
      dispatch(sendRequest(item, collectionUid));
    }
  }, []);

  const value = useQuery({
    queryKey: ['response-body', requestId],
    retry: false,
    staleTime: 0,
    gcTime: 0,
    queryFn: async (ctx) => {
      const data = await fetch(`response-body://${requestId}`, { signal: ctx.signal });
      const text = await data.text();
      return parse(text) as object;
    }
  });

  const filtered = useMemo(() => {
    if (value.isLoading) {
      return '';
    }

    if (!filter.trim()) {
      return stringify(value.data, null, 2);
    }

    const filtered = JSONPath({ json: value.data, path: filter, wrap: false });
    return stringify(filtered, null, 2);
  }, [filter, value.data]);

  return (
    <>
      <div className={classes.filterContainer} data-opened={filterOpened}>
        <ActionIcon
          size={'input-sm'}
          variant={'default'}
          aria-label="Open JSON filter"
          onClick={() => setFilterOpened(!filterOpened)}
        >
          <IconFilter size={20} stroke={1.5} />
        </ActionIcon>
        <TextInput
          className={classes.filterInput}
          aria-hidden={!filterOpened}
          placeholder={'Filter with "jsonpath-plus"'}
          defaultValue={filter}
          onChange={(evt) => setFilter(evt.currentTarget.value)}
        />
      </div>
      <CodeEditor onRun={onRun} value={filtered} mode={'json'} height={'100%'} readOnly />
    </>
  );
};
