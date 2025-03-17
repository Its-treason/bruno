import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import { saveCollectionRoot, sendCollectionOauth2Request } from 'providers/ReduxStore/slices/collections/actions';
import { AuthSelector } from 'feature/auth-selector';
import { useCallback } from 'react';
import { updateCollectionAuth } from 'providers/ReduxStore/slices/collections';

const Auth = ({ collection }) => {
  const auth = get(collection, 'root.request.auth');
  const dispatch = useDispatch();

  const handleSave = () => dispatch(saveCollectionRoot(collection.uid));

  const onRun = async () => {
    dispatch(sendCollectionOauth2Request(collection.uid));
  };

  const onChange = useCallback((auth) => {
    dispatch(
      updateCollectionAuth({
        collectionUid: collection.uid,
        auth
      })
    );
  });

  return (
    <div className="w-full h-full">
      <div className="text-xs mb-4 text-muted">
        Configures authentication for the entire collection. This applies to all requests using the{' '}
        <span className="font-medium">Inherit</span> option in the <span className="font-medium">Auth</span> tab.
      </div>

      <AuthSelector onChange={onChange} auth={auth} collectionUid={collection.uid} onRun={onRun} onSave={handleSave} />

      <div className="mt-6">
        <button type="submit" className="submit btn btn-sm btn-secondary" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
};

export default Auth;
