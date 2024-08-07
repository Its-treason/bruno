/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';

type MonacoEditor = editor.IStandaloneCodeEditor;

const buildSuggestions = (monaco: Monaco) => [
  // Res
  {
    label: 'res',
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: 'res.',
    documentation: 'The response object.'
  },
  {
    label: 'res.status',
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: 'res.status',
    documentation: 'The response status code.'
  },
  {
    label: 'res.statusText',
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: 'res.statusText',
    documentation: 'The response status text.'
  },
  {
    label: 'res.headers',
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: 'res.headers',
    documentation: 'The response headers.'
  },
  {
    label: 'res.body',
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: 'res.body',
    documentation: 'The response body.'
  },
  {
    label: 'res.responseTime',
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: 'res.responseTime',
    documentation: 'The response time.'
  },
  {
    label: 'res.getStatus()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'res.getStatus()',
    documentation: 'Returns the response status code.'
  },
  {
    label: 'res.getStatusText()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'res.getStatusText()',
    documentation: 'Returns the response status text.'
  },
  {
    label: 'res.getHeader(name)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'res.getHeader()',
    documentation: 'Returns the response header with the given name.'
  },
  {
    label: 'res.getHeaders()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'res.getHeaders()',
    documentation: 'Returns the response headers.'
  },
  {
    label: 'res.getBody()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'res.getBody()',
    documentation: 'Returns the response body.'
  },
  {
    label: 'res.getResponseTime()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'res.getResponseTime()',
    documentation: 'Returns the response time.'
  },
  // Req
  {
    label: 'req',
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: 'req.',
    documentation: 'The request object.'
  },
  {
    label: 'req.url',
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: 'req.url',
    documentation: 'The request URL.'
  },
  {
    label: 'req.method',
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: 'req.method',
    documentation: 'The request method.'
  },
  {
    label: 'req.headers',
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: 'req.headers',
    documentation: 'The request headers.'
  },
  {
    label: 'req.body',
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: 'req.body',
    documentation: 'The request body.'
  },
  {
    label: 'req.timeout',
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: 'req.timeout',
    documentation: 'The request timeout.'
  },
  {
    label: 'req.getUrl()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'req.getUrl()',
    documentation: 'Returns the request URL.'
  },
  {
    label: 'req.setUrl(url)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'req.setUrl()',
    documentation: 'Sets the request URL.'
  },
  {
    label: 'req.getMethod()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'req.getMethod()',
    documentation: 'Returns the request method.'
  },
  {
    label: 'req.setMethod(method)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'req.setMethod()',
    documentation: 'Sets the request method.'
  },
  {
    label: 'req.getHeader(name)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'req.getHeader()',
    documentation: 'Returns the request header with the given name.'
  },
  {
    label: 'req.getHeaders()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'req.getHeaders()',
    documentation: 'Returns the request headers.'
  },
  {
    label: 'req.setHeader(name, value)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'req.setHeader()',
    documentation: 'Sets the request header with the given name and value.'
  },
  {
    label: 'req.setHeaders(data)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'req.setHeaders()',
    documentation: 'Sets the request headers.'
  },
  {
    label: 'req.getBody()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'req.getBody()',
    documentation: 'Returns the request body.'
  },
  {
    label: 'req.setBody(data)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'req.setBody()',
    documentation: 'Sets the request body.'
  },
  {
    label: 'req.setMaxRedirects(maxRedirects)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'req.setMaxRedirects()',
    documentation: 'Sets the maximum number of redirects.'
  },
  {
    label: 'req.getTimeout()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'req.getTimeout()',
    documentation: 'Returns the request timeout.'
  },
  {
    label: 'req.setTimeout(timeout)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'req.setTimeout()',
    documentation: 'Sets the request timeout.'
  },
  // Bru
  {
    label: 'bru.interpolate()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.interpolate()',
    documentation: 'Interpolates a string with placeholders.'
  },
  {
    label: 'bru.cwd()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.cwd()',
    documentation: 'Returns the current working directory.'
  },
  {
    label: 'bru.getEnvName()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.getEnvName()',
    documentation: 'Returns the name of the current environment or undefined if none is selected.'
  },
  {
    label: 'bru.getProcessEnv()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.getProcessEnv()',
    documentation: 'Returns a process environment variable.'
  },
  {
    label: 'bru.hasEnvVar()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.hasEnvVar()',
    documentation: 'Returns a true if an environment variable exists.'
  },
  {
    label: 'bru.getEnvVar()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.getEnvVar()',
    documentation: 'Returns the value of the environment variable with the given key.'
  },
  {
    label: 'bru.setEnvVar()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.setEnvVar()',
    documentation: 'Sets the value of the environment variable with the given key.'
  },
  {
    label: 'bru.hasVar()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.hasVar()',
    documentation: 'Returns true if an collection variable exists.'
  },
  {
    label: 'bru.setVar()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.setVar()',
    documentation: 'Sets the value of the variable with the given key.'
  },
  {
    label: 'bru.deleteVar()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.deleteVar()',
    documentation: 'Removes an collection variable.'
  },
  {
    label: 'bru.getVar()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.getVar()',
    documentation: 'Returns the value of the variable with the given key.'
  },
  {
    label: 'bru.getRequestVar()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.getRequestVar()',
    documentation: 'Returns the value of the request variable for the given key.'
  },
  {
    label: 'bru.setNextRequest()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.setNextRequest()',
    documentation: 'Sets the name for the next request in the collection runner.'
  }
];

export const initMonaco = (monaco: Monaco) => {
  monaco.editor.defineTheme('bruno-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [{ background: '#00000000', token: '' }],
    colors: {
      'editor.background': '#00000000',
      'minimap.background': '#00000000',
      'editorOverviewRuler.background': '#00000000'
    }
  });
  monaco.editor.defineTheme('bruno-light', {
    base: 'vs',
    inherit: true,
    rules: [{ background: '#00000000', token: '' }],
    colors: {
      'editor.background': '#00000000',
      'minimap.background': '#00000000',
      'editorOverviewRuler.background': '#00000000'
    }
  });
  monaco.languages.typescript.typescriptDefaults.addExtraLib(`
  declare const res: {
    status: number;
    statusText: string;
    headers: any;
    body: any;
    responseTime: number;
    getStatus(): number;
    getStatusText(): string;
    getHeader(name: string): string;
    getHeaders(): any;
    getBody(): any;
    getResponseTime(): number;
  };
  declare const req: {
    url: string;
    method: string;
    headers: any;
    body: any;
    timeout: number;
    getUrl(): string;
    setUrl(url: string): void;
    getMethod(): string;
    setMethod(method: string): void;
    getHeader(name: string): string;
    getHeaders(): any;
    setHeader(name: string, value: string): void;
    setHeaders(data: any): void;
    getBody(): any;
    setBody(data: any): void;
    setMaxRedirects(maxRedirects: number): void;
    getTimeout(): number;
    setTimeout(timeout: number): void;
  };
  declare const bru: {
    interpolate(target: unknown): string | unknown;
    cwd(): string;
    getEnvName(): ?string;
    getProcessEnv(key: string): unknown;
    hasEnvVar(key: string): boolean;
    getEnvVar(key: string): any;
    setEnvVar(key: string, value: any): void;
    hasVar(key: string): boolean;
    setVar(key: string, value: any): void;
    deleteVar(key: string): void;
    getVar(key: string): any;
    getRequestVar(key: string): unknown;
    setNextRequest(nextRequest: string): void;
  };
`);
  monaco.languages.registerCompletionItemProvider('typescript', {
    provideCompletionItems: () => ({
      // @ts-expect-error `range` is missing here, but is still works
      suggestions: buildSuggestions(monaco)
    })
  });

  // javascript is solely used for the query editor
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    diagnosticCodesToIgnore: [1109, 2580, 2451, 80005, 1375, 1378]
  });
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    allowComments: true
  });
};

const createEditorAction = (id: string, keybindings: number[], label: string, run: () => void) => {
  return {
    id,
    keybindings,
    label,
    run
  };
};

export type BrunoEditorCallbacks = {
  onChange?: (newValue: string) => void;
  onSave?: () => void;
  onRun?: () => void;
};

export const addMonacoCommands = (
  monaco: Monaco,
  editor: editor.IStandaloneCodeEditor,
  callbacks: BrunoEditorCallbacks
) => {
  const editorActions = [
    createEditorAction('save', [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS], 'Save', () => {
      callbacks.onChange && callbacks.onChange(editor.getValue());
      callbacks.onSave && callbacks.onSave();
    }),
    createEditorAction('run', [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter], 'Run', () => {
      callbacks.onRun && callbacks.onRun();
    }),
    createEditorAction('foldAll', [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyY], 'FoldAll', () => {
      editor.trigger('fold', 'editor.foldAll', null);
    }),
    createEditorAction('unfoldAll', [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI], 'UnfoldAll', () => {
      editor.trigger('fold', 'editor.unfoldAll', null);
    })
  ];
  editorActions.forEach((action) => editor.addAction(action));
};

export const addMonacoSingleLineActions = (
  editor: MonacoEditor,
  monaco: Monaco,
  allowNewlines: boolean,
  setHeight: (newHeight: number) => void
) => {
  editor.onKeyDown((e) => {
    if (e.keyCode === monaco.KeyCode.Enter && allowNewlines === false) {
      // @ts-expect-error Not sure why the type does not work
      if (editor.getContribution('editor.contrib.suggestController')?.model.state == 0) {
        e.preventDefault();
      }
    }
  });

  editor.onDidPaste((e) => {
    // Remove all newlines for the singleline editor
    if (e.range.endLineNumber > 1 && allowNewlines === false) {
      const modal = editor.getModel();
      if (!modal) {
        return;
      }

      let newContent = '';
      let lineCount = modal.getLineCount() || 0;
      for (let i = 0; i < lineCount; i++) {
        newContent += modal.getLineContent(i + 1) || 1;
      }
      modal.setValue(newContent);
    }
  });

  // This will remove the highlighting of hovered words
  editor.onDidBlurEditorText(() => {
    editor.setPosition({ column: 1, lineNumber: 1 });
  });

  editor.onDidContentSizeChange(() => {
    setHeight(Math.min(128, editor.getContentHeight()));
  });
  setHeight(Math.min(128, editor.getContentHeight()));
};

export const getMonacoModeFromContent = (contentType: string, body: string | Record<string, unknown>) => {
  if (typeof body === 'object') {
    return 'application/ld+json';
  }
  if (!contentType || typeof contentType !== 'string') {
    return 'application/text';
  }

  if (contentType.includes('json')) {
    return 'application/ld+json';
  } else if (contentType.includes('xml')) {
    return 'application/xml';
  } else if (contentType.includes('html')) {
    return 'application/html';
  } else if (contentType.includes('text')) {
    return 'application/text';
  } else if (contentType.includes('application/edn')) {
    return 'application/xml';
  } else if (contentType.includes('yaml')) {
    return 'application/yaml';
  } else if (contentType.includes('image')) {
    return 'application/image';
  } else {
    return 'application/text';
  }
};
