import { createContext } from 'react';

export const CodeEditorVariableContext = createContext<{
  variables: Record<string, string>;
  pathParams: Record<string, string>;
}>({
  pathParams: {},
  variables: {}
});
