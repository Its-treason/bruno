import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import CodeEditor from 'src/components/CodeEditor';
import { updateCollectionAuth } from 'providers/ReduxStore/slices/collections';
import { saveCollectionRoot } from 'providers/ReduxStore/slices/collections/actions';
import StyledWrapper from './StyledWrapper';

const BearerAuth = ({ collection }) => {
  const dispatch = useDispatch();

  const bearerToken = get(collection, 'root.request.auth.bearer.token', '');

  const handleSave = () => dispatch(saveCollectionRoot(collection.uid));

  const handleTokenChange = (token) => {
    dispatch(
      updateCollectionAuth({
        mode: 'bearer',
        collectionUid: collection.uid,
        content: {
          token: token
        }
      })
    );
  };

  return (
    <StyledWrapper className="mt-2 w-full">
      <label className="block font-medium mb-2">Token</label>
      <div className="single-line-editor-wrapper">
        <CodeEditor singleLine value={bearerToken} onSave={handleSave} onChange={(val) => handleTokenChange(val)} />
      </div>
    </StyledWrapper>
  );
};

export default BearerAuth;
