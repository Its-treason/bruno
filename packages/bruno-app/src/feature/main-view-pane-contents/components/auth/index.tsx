import { RequestItemSchema } from '@usebruno/schema';
import { AuthSelector } from 'feature/auth-selector';
import { updateAuth } from 'providers/ReduxStore/slices/collections';
import { saveRequest, sendRequest } from 'providers/ReduxStore/slices/collections/actions';
import React from 'react';
import { useDispatch } from 'react-redux';

type AuthProps = {
  item: RequestItemSchema;
  collectionUid: string;
};

export const Auth: React.FC<AuthProps> = ({ collectionUid, item }) => {
  const dispatch = useDispatch();

  const handleRun = async () => {
    dispatch(sendRequest(item, collectionUid));
  };
  const handleSave = () => dispatch(saveRequest(item.uid, collectionUid));

  const onChange = (auth) => {
    dispatch(
      updateAuth({
        collectionUid,
        itemUid: item.uid,
        auth
      })
    );
  };

  return (
    <AuthSelector
      onChange={onChange}
      auth={item.draft ? item.draft.request.auth : item.request.auth}
      collectionUid={collectionUid}
      onRun={handleRun}
      onSave={handleSave}
      showInherit
    />
  );
};
