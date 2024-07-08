import { Provider } from 'react-redux';
import { AppProvider } from 'providers/App';
import { ToastProvider } from 'providers/Toaster';
import { HotkeysProvider } from 'providers/Hotkeys';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTheme, MantineProvider, Timeline, Tooltip } from '@mantine/core';

import ReduxStore from 'providers/ReduxStore';
import ThemeProvider from 'providers/Theme/index';
import ErrorBoundary from './ErrorBoundary';

import '../styles/globals.css';
import 'graphiql/graphiql.min.css';
import 'react-tooltip/dist/react-tooltip.css';
import '@usebruno/graphql-docs/dist/style.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@mantine/core/styles.css';

const queryClient = new QueryClient();

const theme = createTheme({
  focusRing: 'never',
  defaultRadius: 'xs',
  primaryColor: 'orange',

  colors: {
    orange: [
      '#fff5e1',
      '#ffebcd',
      '#fbd59e',
      '#f7be6c',
      '#f4aa41',
      '#f29d25',
      '#f29714',
      '#d88304',
      '#c07300',
      '#a76200'
    ]
  },

  components: {
    Timeline: Timeline.extend({
      defaultProps: {
        radius: 'xs'
      }
    }),

    Tooltip: Tooltip.extend({
      defaultProps: {
        openDelay: 250
      }
    })
  }
});

export function App({ children }) {
  if (!window.ipcRenderer) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-10 my-10 rounded relative"
        role="alert"
      >
        <strong className="font-bold">ERROR:</strong>
        <span className="block inline ml-1">"ipcRenderer" not found in window object.</span>
        <div>
          You most likely opened Bruno inside your web browser. Bruno only works within Electron, you can start Electron
          in an adjacent terminal using "npm run dev:electron".
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <MantineProvider theme={theme} defaultColorScheme={'dark'}>
        <QueryClientProvider client={queryClient}>
          <Provider store={ReduxStore}>
            <ThemeProvider>
              <ToastProvider>
                <AppProvider>
                  <HotkeysProvider>{children}</HotkeysProvider>
                </AppProvider>
              </ToastProvider>
            </ThemeProvider>
          </Provider>
        </QueryClientProvider>
      </MantineProvider>
    </ErrorBoundary>
  );
}
