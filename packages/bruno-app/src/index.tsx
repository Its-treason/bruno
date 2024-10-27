import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './pages/App';
import { Main } from './pages';
import GlobalStyle from './globalStyles';
import '@mantine/tiptap/styles.css';
import { enableMapSet } from 'immer';

enableMapSet();

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App>
        <GlobalStyle />
        <Main />
      </App>
    </React.StrictMode>
  );
}
