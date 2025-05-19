import React, { useEffect } from 'react';
import { get } from 'lodash';
import { useDispatch } from 'react-redux';
import { refreshScreenWidth } from 'providers/ReduxStore/slices/app';
import ConfirmAppClose from './ConfirmAppClose';
import useIpcEvents from './useIpcEvents';
import StyledWrapper from './StyledWrapper';
import { useMonaco } from '@monaco-editor/react';
import { initMonaco } from 'components/CodeEditor/utils/monocoInit';
import loader from '@monaco-editor/loader';
import { GlobalHotkeys } from 'components/GlobalHotkeys';

// Init the Monaco loader. This ensures that local monaco instance is used and no js is loaded from a cdn
loader.config({ paths: { vs: '/vs' } });

export const AppContext = React.createContext();

export const AppProvider = (props) => {
  useIpcEvents();

  const monaco = useMonaco();
  const dispatch = useDispatch();

  useEffect(() => {
    if (monaco) {
      initMonaco(monaco);
    }
  }, [monaco]);

  useEffect(() => {
    dispatch(refreshScreenWidth());
  }, []);

  useEffect(() => {
    const platform = get(navigator, 'platform', '');
    if (platform && platform.toLowerCase().indexOf('mac') > -1) {
      document.body.classList.add('os-mac');
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      dispatch(refreshScreenWidth());
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AppContext.Provider {...props} value="appProvider">
      <StyledWrapper>
        <ConfirmAppClose />
        <GlobalHotkeys />
        {props.children}
      </StyledWrapper>
    </AppContext.Provider>
  );
};

export default AppProvider;
