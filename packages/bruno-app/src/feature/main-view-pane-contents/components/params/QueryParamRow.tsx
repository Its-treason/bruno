import { ActionIcon, Checkbox, rem, Table } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { ParamSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import { deleteQueryParam, updateQueryParam } from 'providers/ReduxStore/slices/collections';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

type QueryParamRowProps = {
  param: ParamSchema;
  itemUid: string;
  collectionUid: string;

  onRun: () => void;
  onSave: () => void;
};

export const QueryParamRow: React.FC<QueryParamRowProps> = ({ collectionUid, itemUid, param, onRun, onSave }) => {
  const dispatch = useDispatch();

  const onParamValueChange = useCallback(
    <K extends keyof ParamSchema>(key: K, value: ParamSchema[K]) => {
      const queryParam = { ...param };
      queryParam[key] = value;

      dispatch(
        updateQueryParam({
          queryParam,
          itemUid,
          collectionUid
        })
      );
    },
    [itemUid, collectionUid, param, dispatch]
  );

  const onRemoveParam = useCallback(() => {
    dispatch(
      deleteQueryParam({
        paramUid: param.uid,
        itemUid,
        collectionUid
      })
    );
  }, [itemUid, collectionUid, param.uid, dispatch]);

  return (
    <Table.Tr key={param.uid}>
      <Table.Td>
        <Checkbox
          checked={param.enabled}
          aria-label="Param enabled"
          onChange={(evt) => onParamValueChange('enabled', evt.currentTarget.checked)}
        />
      </Table.Td>
      <Table.Td>
        <CodeEditor
          value={param.name}
          onChange={(newValue) => onParamValueChange('name', newValue)}
          onRun={onRun}
          onSave={onSave}
          singleLine
          withVariables
          asInput
        />
      </Table.Td>
      <Table.Td>
        <CodeEditor
          value={param.value}
          onChange={(newValue) => onParamValueChange('value', newValue)}
          onRun={onRun}
          onSave={onSave}
          singleLine
          withVariables
          asInput
        />
      </Table.Td>
      <Table.Td>
        <ActionIcon aria-label="Delete param" color={'red'} variant="subtle" onClick={onRemoveParam}>
          <IconTrash style={{ width: rem(18) }} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
};
