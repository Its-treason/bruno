import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import CodeEditor from 'src/components/CodeEditor';
import { updateCollectionAuth } from 'providers/ReduxStore/slices/collections';
import { saveCollectionRoot } from 'providers/ReduxStore/slices/collections/actions';
import StyledWrapper from './StyledWrapper';

const AwsV4Auth = ({ collection }) => {
  const dispatch = useDispatch();

  const awsv4Auth = get(collection, 'root.request.auth.awsv4', {});

  const handleSave = () => dispatch(saveCollectionRoot(collection.uid));

  const handleAccessKeyIdChange = (accessKeyId) => {
    dispatch(
      updateCollectionAuth({
        mode: 'awsv4',
        collectionUid: collection.uid,
        content: {
          accessKeyId: accessKeyId,
          secretAccessKey: awsv4Auth.secretAccessKey,
          sessionToken: awsv4Auth.sessionToken,
          service: awsv4Auth.service,
          region: awsv4Auth.region,
          profileName: awsv4Auth.profileName
        }
      })
    );
  };

  const handleSecretAccessKeyChange = (secretAccessKey) => {
    dispatch(
      updateCollectionAuth({
        mode: 'awsv4',
        collectionUid: collection.uid,
        content: {
          accessKeyId: awsv4Auth.accessKeyId,
          secretAccessKey: secretAccessKey,
          sessionToken: awsv4Auth.sessionToken,
          service: awsv4Auth.service,
          region: awsv4Auth.region,
          profileName: awsv4Auth.profileName
        }
      })
    );
  };

  const handleSessionTokenChange = (sessionToken) => {
    dispatch(
      updateCollectionAuth({
        mode: 'awsv4',
        collectionUid: collection.uid,
        content: {
          accessKeyId: awsv4Auth.accessKeyId,
          secretAccessKey: awsv4Auth.secretAccessKey,
          sessionToken: sessionToken,
          service: awsv4Auth.service,
          region: awsv4Auth.region,
          profileName: awsv4Auth.profileName
        }
      })
    );
  };

  const handleServiceChange = (service) => {
    dispatch(
      updateCollectionAuth({
        mode: 'awsv4',
        collectionUid: collection.uid,
        content: {
          accessKeyId: awsv4Auth.accessKeyId,
          secretAccessKey: awsv4Auth.secretAccessKey,
          sessionToken: awsv4Auth.sessionToken,
          service: service,
          region: awsv4Auth.region,
          profileName: awsv4Auth.profileName
        }
      })
    );
  };

  const handleRegionChange = (region) => {
    dispatch(
      updateCollectionAuth({
        mode: 'awsv4',
        collectionUid: collection.uid,
        content: {
          accessKeyId: awsv4Auth.accessKeyId,
          secretAccessKey: awsv4Auth.secretAccessKey,
          sessionToken: awsv4Auth.sessionToken,
          service: awsv4Auth.service,
          region: region,
          profileName: awsv4Auth.profileName
        }
      })
    );
  };

  const handleProfileNameChange = (profileName) => {
    dispatch(
      updateCollectionAuth({
        mode: 'awsv4',
        collectionUid: collection.uid,
        content: {
          accessKeyId: awsv4Auth.accessKeyId,
          secretAccessKey: awsv4Auth.secretAccessKey,
          sessionToken: awsv4Auth.sessionToken,
          service: awsv4Auth.service,
          region: awsv4Auth.region,
          profileName: profileName
        }
      })
    );
  };

  return (
    <StyledWrapper className="mt-2 w-full">
      <label className="block font-medium mb-2">Access Key ID</label>
      <div className="single-line-editor-wrapper mb-2">
        <CodeEditor
          singleLine
          withVariables
          value={awsv4Auth.accessKeyId || ''}
          onSave={handleSave}
          onChange={(val) => handleAccessKeyIdChange(val)}
        />
      </div>

      <label className="block font-medium mb-2">Secret Access Key</label>
      <div className="single-line-editor-wrapper mb-2">
        <CodeEditor
          singleLine
          withVariables
          value={awsv4Auth.secretAccessKey || ''}
          onSave={handleSave}
          onChange={(val) => handleSecretAccessKeyChange(val)}
        />
      </div>

      <label className="block font-medium mb-2">Session Token</label>
      <div className="single-line-editor-wrapper mb-2">
        <CodeEditor
          singleLine
          withVariables
          value={awsv4Auth.sessionToken || ''}
          onSave={handleSave}
          onChange={(val) => handleSessionTokenChange(val)}
        />
      </div>

      <label className="block font-medium mb-2">Service</label>
      <div className="single-line-editor-wrapper mb-2">
        <CodeEditor
          singleLine
          withVariables
          value={awsv4Auth.service || ''}
          onSave={handleSave}
          onChange={(val) => handleServiceChange(val)}
        />
      </div>

      <label className="block font-medium mb-2">Region</label>
      <div className="single-line-editor-wrapper mb-2">
        <CodeEditor
          singleLine
          value={awsv4Auth.region || ''}
          onSave={handleSave}
          onChange={(val) => handleRegionChange(val)}
        />
      </div>

      <label className="block font-medium mb-2">Profile Name</label>
      <div className="single-line-editor-wrapper mb-2">
        <CodeEditor
          singleLine
          value={awsv4Auth.profileName || ''}
          onSave={handleSave}
          onChange={(val) => handleProfileNameChange(val)}
        />
      </div>
    </StyledWrapper>
  );
};

export default AwsV4Auth;
