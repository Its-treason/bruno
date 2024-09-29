import React from 'react';
import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import CodeEditor from 'components/CodeEditor';
import { updateCollectionTests } from 'providers/ReduxStore/slices/collections';
import { saveCollectionRoot } from 'providers/ReduxStore/slices/collections/actions';
import StyledWrapper from './StyledWrapper';

const Tests = ({ collection }) => {
  const dispatch = useDispatch();
  const tests = get(collection, 'root.request.tests', '');

  const onEdit = (value) => {
    dispatch(
      updateCollectionTests({
        tests: value,
        collectionUid: collection.uid
      })
    );
  };

  const handleSave = () => dispatch(saveCollectionRoot(collection.uid));

  return (
    <StyledWrapper className="w-full flex flex-col h-full">
      <div className="text-xs mb-4 text-muted">These tests will run any time a request in this collection is sent.</div>
      <CodeEditor
        value={tests || ''}
        onChange={onEdit}
        mode="javascript"
        onSave={handleSave}
        height={'70vh'}
        extraLibs={['bru', 'chai', 'req', 'res']}
      />

      <div className="mt-6">
        <button type="submit" className="submit btn btn-sm btn-secondary" onClick={handleSave}>
          Save
        </button>
      </div>
    </StyledWrapper>
  );
};

export default Tests;
