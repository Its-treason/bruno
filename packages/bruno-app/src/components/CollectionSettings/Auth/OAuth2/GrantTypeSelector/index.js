import React, { useRef, forwardRef } from 'react';
import get from 'lodash/get';
import Dropdown from 'components/Dropdown';
import { useDispatch } from 'react-redux';
import StyledWrapper from './StyledWrapper';
import { IconCaretDown } from '@tabler/icons-react';
import { humanizeGrantType } from 'utils/collections';
import { useEffect } from 'react';
import { updateCollectionAuth, updateCollectionAuthMode } from 'providers/ReduxStore/slices/collections';

const GrantTypeSelector = ({ collection }) => {
  const dispatch = useDispatch();
  const dropdownTippyRef = useRef();
  const onDropdownCreate = (ref) => (dropdownTippyRef.current = ref);

  const oAuth = get(collection, 'root.request.auth.oauth2', {});

  const Icon = forwardRef((props, ref) => {
    return (
      <div ref={ref} className="flex items-center justify-end grant-type-label select-none">
        {humanizeGrantType(oAuth?.grantType)} <IconCaretDown className="caret ml-1 mr-1" size={14} strokeWidth={2} />
      </div>
    );
  });

  const onGrantTypeChange = (grantType) => {
    dispatch(
      updateCollectionAuth({
        mode: 'oauth2',
        collectionUid: collection.uid,
        content: {
          ...collection.root.request.auth.oauth2,
          grantType
        }
      })
    );
  };

  useEffect(() => {
    // initialize redux state with a default oauth2 grant type
    // authorization_code - default option
    !oAuth?.grantType &&
      dispatch(
        updateCollectionAuthMode({
          mode: 'oauth2',
          collectionUid: collection.uid
        })
      );
    !oAuth?.grantType &&
      dispatch(
        updateCollectionAuth({
          mode: 'oauth2',
          collectionUid: collection.uid,
          content: {
            grantType: 'authorization_code'
          }
        })
      );
  }, [oAuth]);

  return (
    <StyledWrapper>
      <label className="block font-medium mb-2">Grant Type</label>
      <div className="inline-flex items-center cursor-pointer grant-type-mode-selector w-fit">
        <Dropdown onCreate={onDropdownCreate} icon={<Icon />} placement="bottom-end">
          <div
            className="dropdown-item"
            onClick={() => {
              dropdownTippyRef.current.hide();
              onGrantTypeChange('password');
            }}
          >
            Password Credentials
          </div>
          <div
            className="dropdown-item"
            onClick={() => {
              dropdownTippyRef.current.hide();
              onGrantTypeChange('authorization_code');
            }}
          >
            Authorization Code
          </div>
          <div
            className="dropdown-item"
            onClick={() => {
              dropdownTippyRef.current.hide();
              onGrantTypeChange('client_credentials');
            }}
          >
            Client Credentials
          </div>
        </Dropdown>
      </div>
    </StyledWrapper>
  );
};
export default GrantTypeSelector;
