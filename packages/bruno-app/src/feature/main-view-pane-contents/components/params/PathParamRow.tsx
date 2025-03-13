import { Table } from '@mantine/core';
import { ParamSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import { updatePathParam } from 'providers/ReduxStore/slices/collections';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

type PathParamRowProps = {
  param: ParamSchema;
  itemUid: string;
  collectionUid: string;

  onRun: () => void;
  onSave: () => void;
};

export const PathParamRow: React.FC<PathParamRowProps> = ({ collectionUid, itemUid, param, onRun, onSave }) => {
  const dispatch = useDispatch();

  const onParamValueChange = useCallback(
    (value: string) => {
      const pathParam = { ...param };
      pathParam.value = value;

      dispatch(
        updatePathParam({
          pathParam,
          itemUid,
          collectionUid
        })
      );
    },
    [itemUid, collectionUid, param, dispatch]
  );

  return (
    <Table.Tr key={param.uid}>
      <Table.Td>
        <CodeEditor value={param.name} onRun={onRun} onSave={onSave} singleLine withVariables readOnly asInput />
      </Table.Td>
      <Table.Td>
        <CodeEditor
          value={param.value}
          onChange={(newValue) => onParamValueChange(newValue)}
          onRun={onRun}
          onSave={onSave}
          singleLine
          withVariables
          asInput
        />
      </Table.Td>
    </Table.Tr>
  );
};
