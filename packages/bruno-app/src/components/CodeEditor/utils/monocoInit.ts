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
  {
    label: 'res.setBody(newBody: unknown)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'res.getResponseTime()',
    documentation:
      'Overwrites the response Body. Useful if the response is encodes in some other way and must be decoded with a script'
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
  {
    label: 'req.disableParsingResponseJson()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'req.disableParsingResponseJson()',
    documentation:
      'Noop function for Bruno compatibility. This would disable JSON parsing in Bruno, but Lazer not have parsing issues.'
  },
  {
    label: 'req.getExecutionMode()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'req.getExecutionMode()',
    documentation:
      'Return "standalone" or "runner" depending on, if the request is executed directly or from the request runner'
  },
  // Bru
  {
    label: 'bru.interpolate()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.interpolate()',
    documentation: 'Interpolates a string with placeholders. Only available in Lazer.'
  },
  {
    label: 'bru.cwd()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.cwd()',
    documentation: 'Returns the path to the collection root.'
  },
  {
    label: 'bru.getEnvName()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.getEnvName()',
    documentation: 'Returns the name of the current environment or undefined if none is selected.'
  },
  {
    label: 'bru.getProcessEnv(name: string): ?string',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.getProcessEnv()',
    documentation: 'Returns a process environment variable.'
  },
  {
    label: 'bru.hasEnvVar(name: string)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.hasEnvVar()',
    documentation: 'Returns a true if an environment variable exists.'
  },
  {
    label: 'bru.getEnvVar(name: string)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.getEnvVar()',
    documentation: 'Returns the value of the environment variable with the given key.'
  },
  {
    label: 'bru.setEnvVar(name: string, value: unknown)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.setEnvVar()',
    documentation: 'Sets the value of the environment variable with the given key.'
  },
  {
    label: 'bru.hasVar(name: string): bool',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.hasVar()',
    documentation: 'Returns true if an collection variable exists.'
  },
  {
    label: 'bru.setVar(name: string, value: unknown)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.setVar()',
    documentation: 'Sets a runtime variable.'
  },
  {
    label: 'bru.deleteVar(name: string)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.deleteVar()',
    documentation: 'Removes a runtime variable.'
  },
  {
    label: 'bru.getVar(name: string)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.getVar()',
    documentation: 'Returns the value of a runtime variable'
  },
  {
    label: 'bru.getRequestVar(name: string)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.getRequestVar()',
    documentation: 'Returns the value of the request variable for the given key.'
  },
  {
    label: 'bru.setNextRequest(nextRequest: string)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.setNextRequest()',
    documentation: 'Sets the name for the next request in the collection runner.'
  },
  {
    label: 'bru.sleep(ms: number): Promise<void>',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.sleep()',
    documentation: 'Sleep utiltlty function. Note: that the Promise of this function must be awaited'
  },
  {
    label: 'bru.getCollectionVar(name: string)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.getCollectionVar()',
    documentation: 'Returns the value of a collection variable'
  },
  {
    label: 'bru.getFolderVar(name: string)',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.getFolderVar()',
    documentation: 'Returns the value of a folder variable'
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
    setBody(newBody: unknown): void;
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
    disableParsingResponseJson(): void;
    getExecutionMode(): 'standalone' | 'runner';
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
    getCollectionVar(key: string): unknown;
    getFolderVar(key: string): unknown;
    setNextRequest(nextRequest: string): void;
    sleep(ms: number): Promise<void>;
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
