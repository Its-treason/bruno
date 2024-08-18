import React from 'react';
import get from 'lodash/get';
import FormUrlEncodedParams from 'components/RequestPane/FormUrlEncodedParams';
import MultipartFormParams from 'components/RequestPane/MultipartFormParams';
import { useDispatch } from 'react-redux';
import { updateRequestBody } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import CodeEditor from 'components/CodeEditor';

const RequestBody = ({ item, collection }) => {
  const dispatch = useDispatch();
  const body = item.draft ? get(item, 'draft.request.body') : get(item, 'request.body');
  const bodyMode = item.draft ? get(item, 'draft.request.body.mode') : get(item, 'request.body.mode');

  if (['json', 'xml', 'text', 'sparql'].includes(bodyMode)) {
    const onEdit = (value) => {
      dispatch(
        updateRequestBody({
          content: value,
          itemUid: item.uid,
          collectionUid: collection.uid
        })
      );
    };

    const onRun = () => dispatch(sendRequest(item, collection.uid));
    const onSave = () => dispatch(saveRequest(item.uid, collection.uid));

    return (
      <CodeEditor
        value={body[bodyMode] || ''}
        onChange={onEdit}
        onRun={onRun}
        onSave={onSave}
        mode={bodyMode}
        withVariables
        height={'calc(100% - var(--mantine-spacing-xs))'}
      />
    );
  }

  if (bodyMode === 'formUrlEncoded') {
    return <FormUrlEncodedParams item={item} collection={collection} />;
  }

  if (bodyMode === 'multipartForm') {
    return <MultipartFormParams item={item} collection={collection} />;
  }

  return <div className="w-full">No Body</div>;
};
export default RequestBody;
