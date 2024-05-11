/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Monaco } from '@monaco-editor/react';
import { stringify } from 'lossless-json';
import { IDisposable, Position, editor, IRange } from 'monaco-editor';
import colors from 'tailwindcss/colors';

type MonacoEditor = editor.IStandaloneCodeEditor;

const buildSuggestions = (monaco: Monaco) => [
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
    label: 'bru.getProcessEnv()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.getProcessEnv()',
    documentation: 'Returns the current process environment variables.'
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
    label: 'bru.getVar()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.getVar()',
    documentation: 'Returns the value of the variable with the given key.'
  },
  {
    label: 'bru.setVar()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.setVar()',
    documentation: 'Sets the value of the variable with the given key.'
  },
  {
    label: 'bru.cwd()',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'bru.cwd()',
    documentation: 'Returns the current working directory.'
  }
];

// This function will check if we hover over a variable by first going the left and then to right to find the
// opening and closing curly brackets
export const getWordAtPosition = (
  model: editor.ITextModel,
  monaco: Monaco,
  position: Position
): null | [string, IRange] => {
  const range = {
    startColumn: position.column,
    endColumn: position.column,
    startLineNumber: position.lineNumber,
    endLineNumber: position.lineNumber
  };

  // Check for the beginning {{ of a variable
  for (let i = 0; true; i++) {
    // Reached left char limit, just break here
    if (i > 32) {
      return null;
    }

    range.startColumn--;
    // Reached the end of the line
    if (range.startColumn === 0) {
      return null;
    }

    const foundWord = model.getValueInRange(range);

    // If we hover over the start of the variable go to the right and check if anything is there
    if (foundWord === '{') {
      range.startColumn++;
      range.endColumn++;
      continue;
    }

    // We reached the beginning of another variable
    // e.g. example {{test}} here {{test}}
    //                       ^^^^ cursor hovers here
    //                     ^ This will be caught
    if (foundWord.charAt(0) === '}') {
      return null;
    }

    // Check if we reached the end of the
    if (foundWord.charAt(0) === '{' && foundWord.charAt(1) === '{') {
      break;
    }
  }

  // Check for the ending }} of a variable
  for (let i = 0; true; i++) {
    // Reached left char limit, just break here
    if (i > 32) {
      return null;
    }

    range.endColumn++;
    const foundWord = model.getValueInRange(range);

    // Check if we found the end of the variable
    const wordLength = foundWord.length;
    if (foundWord.charAt(wordLength - 1) === '}' && foundWord.charAt(wordLength - 2) === '}') {
      break;
    }
  }

  const foundWord = model.getValueInRange(range);
  // Trim {{, }} and any other spaces, then return the variable
  return [
    foundWord.substring(2, foundWord.length - 2).trim(),
    new monaco.Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn)
  ];
};

let hoverProvider: IDisposable | null;
export const setMonacoVariables = (monaco: Monaco, variables: Record<string, unknown>, mode = '*') => {
  const allVariables = Object.entries(variables ?? {});
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    diagnosticCodesToIgnore: [1109, 2580, 2451, 80005, 1375, 1378]
  });
  monaco.languages.setLanguageConfiguration(mode, {
    autoClosingPairs: [{ open: '{{', close: '}}' }]
  });
  monaco.languages.setMonarchTokensProvider(mode, {
    EnvVariables: Object.keys(variables ?? {}).map((key) => `{{${key}}}`),
    tokenizer: {
      root: [
        [/[^{\/]+/, ''],
        [
          /\{{[^{}]+}}/,
          {
            cases: {
              '@EnvVariables': 'EnvVariables',
              '@default': 'UndefinedVariables'
            }
          }
        ],
        [
          /(https?:\/\/)?\{{[^{}]+}}[^\s/]*\/?/,
          {
            cases: {
              '@EnvVariables': 'EnvVariables',
              '@default': 'UndefinedVariables'
            }
          }
        ]
      ]
    }
  });
  const newHoverProvider = monaco.languages.registerHoverProvider(mode, {
    provideHover: (model, position) => {
      // Rebuild the hoverProvider to avoid memory leaks
      const wordPos = getWordAtPosition(model, monaco, position);
      if (wordPos === null) {
        return null;
      }
      const [word, range] = wordPos;

      const variable = allVariables.find(([key, _]) => key === word);
      if (variable) {
        // Ensure variables value is string
        let value = '';
        if (typeof variable[1] === 'object') {
          try {
            value = stringify(variable[1], null, 2) || 'Unknown object';
          } catch (e) {
            value = `Failed to stringify object: ${e}`;
          }
        } else {
          value = String(variable[1]);
        }

        // Truncate value
        if (value.length > 255) {
          value = value.substring(0, 255) + '... (Truncated)';
        }

        return {
          range,
          contents: [{ value: `**${variable[0]}**` }, { value }]
        };
      } else {
        return {
          range,
          contents: [{ value: `**${word}**` }, { value: 'Variable not found in environment.' }]
        };
      }
    }
  });
  hoverProvider?.dispose();
  hoverProvider = newHoverProvider;

  const typedVariables = Object.entries(variables ?? {}).map(([key, value]) => `declare const ${key}: string`);
  monaco.languages.typescript.javascriptDefaults.setExtraLibs([{ content: typedVariables.join('\n') }]);
};

export const initMonaco = (monaco: Monaco) => {
  monaco.editor.defineTheme('bruno-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      {
        token: 'UndefinedVariables',
        foreground: '#f87171',
        fontStyle: 'medium underline'
      },
      {
        token: 'EnvVariables',
        foreground: '#4ade80',
        fontStyle: 'medium'
      },
      { background: colors.zinc[800], token: '' }
    ],
    colors: {
      'editor.background': '#00000000',
      'editor.foreground': '#ffffff',
      'editorGutter.background': colors.zinc[800]
    }
  });
  monaco.editor.defineTheme('bruno-light', {
    base: 'vs',
    inherit: true,
    rules: [
      {
        token: 'UndefinedVariables',
        foreground: '#dc2626',
        fontStyle: 'medium underline'
      },
      {
        token: 'EnvVariables',
        foreground: '#15803d',
        fontStyle: 'medium'
      },
      { background: colors.zinc[50], token: '' }
    ],
    colors: {
      'editor.background': '#00000000',
      'editorGutter.background': colors.zinc[50]
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
    getEnvVar(key: string) : any;
    setEnvVar(key: string, value: any) : void;
    getVar(key: string) : any;
    setVar(key: string, value: any): void;
    getProcessEnv(): any;
    cwd(): string;
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
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    diagnosticCodesToIgnore: [1109, 2580, 2451, 80005, 1375, 1378]
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
