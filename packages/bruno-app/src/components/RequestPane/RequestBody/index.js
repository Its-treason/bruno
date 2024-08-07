import React from 'react';
import get from 'lodash/get';
import FormUrlEncodedParams from 'components/RequestPane/FormUrlEncodedParams';
import MultipartFormParams from 'components/RequestPane/MultipartFormParams';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from 'providers/Theme';
import { updateRequestBody } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import CodeEditor from 'components/CodeEditor';

const RequestBody = ({ item, collection }) => {
  const dispatch = useDispatch();
  const body = item.draft ? get(item, 'draft.request.body') : get(item, 'request.body');
  const bodyMode = item.draft ? get(item, 'draft.request.body.mode') : get(item, 'request.body.mode');
  const { displayedTheme } = useTheme();
  const preferences = useSelector((state) => state.app.preferences);

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
      <div className="w-full">
        <CodeEditor
          collection={collection}
          theme={displayedTheme}
          font={get(preferences, 'font.codeFont', 'default')}
          value={body[bodyMode] || ''}
          onChange={onEdit}
          onRun={onRun}
          onSave={onSave}
          mode={bodyMode}
          withVariables
        />
      </div>
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
