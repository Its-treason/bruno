import React from 'react';
import { Anchor, Button, Center, Code, Group, Paper, rem, Text, Textarea, Title } from '@mantine/core';
import { IconArrowBack, IconDoorExit } from '@tabler/icons-react';
import { showHomePage } from 'providers/ReduxStore/slices/app';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = { hasError: false, error: null };
  }
  componentDidMount() {
    // Add a global error event listener to capture client-side errors
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('Trigger onerror', { error, source, message, lineno, colno });
    };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Triggered error boundary', { error, errorInfo });
    this.setState({ hasError: true, error });
  }

  returnToApp() {
    const { ipcRenderer } = window;
    ipcRenderer.invoke('open-file');

    // Go back to the homepage in case the currently opened tab has some kind of error
    this.props.store.dispatch(showHomePage());
    this.setState({ hasError: false, error: null });
  }

  forceQuit() {
    const { ipcRenderer } = window;
    ipcRenderer.invoke('main:force-quit');
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorMessageViewer
          error={this.state.error}
          forceQuit={() => this.forceQuit()}
          returnToApp={() => this.returnToApp()}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorMessageViewer = ({ error, forceQuit, returnToApp }) => {
  let errorMessage = String(error);
  if (error instanceof Error && error.stack) {
    errorMessage = String(error.stack);
  }

  return (
    <Center>
      <Paper w={'100%'} maw={rem(750)} mt={'xl'} p={'xl'} withBorder shadow="xl">
        <Title>An error occurred!</Title>
        <Code my={'md'} block c={'red'}>
          {errorMessage}
        </Code>
        <Text>
          Please report this error here:{' '}
          <Anchor href="https://github.com/its-treason/bruno/issues" target="_blank">
            https://github.com/its-treason/bruno/issues
          </Anchor>
        </Text>

        <Group justify="flex-end" mt={'xl'}>
          <Button
            variant="subtle"
            color={'red'}
            onClick={forceQuit}
            leftSection={<IconDoorExit style={{ width: rem(18) }} />}
          >
            Close App
          </Button>

          <Button variant="filled" onClick={returnToApp} leftSection={<IconArrowBack style={{ width: rem(18) }} />}>
            Return to App
          </Button>
        </Group>
      </Paper>
    </Center>
  );
};

export default ErrorBoundary;
