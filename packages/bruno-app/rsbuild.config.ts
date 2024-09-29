import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginStyledComponents } from '@rsbuild/plugin-styled-components';
import { pluginSass } from '@rsbuild/plugin-sass';
import { cpSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'path';

// Make the monaco-editor available to public for offline loading
cpSync(resolve(__dirname, '../../node_modules/monaco-editor/min/vs'), resolve(__dirname, './public/vs'), {
  recursive: true
});

// Copy chai types, for use in initMonaco.ts
const chaiTypes = readFileSync(resolve(__dirname, '../../node_modules/@types/chai/index.d.ts'), 'utf-8');
const globalType = `
declare const test: (name: string, fn: () => Promise<any>) => void;
declare const expect: Chai.ExpectStatic;
declare const assert: Chai.Assert;
`;

const typeInfo = chaiTypes + globalType;
writeFileSync(resolve(__dirname, './public/monacoChaiTypeInfo.d.ts'), typeInfo);

export default defineConfig({
  plugins: [pluginReact(), pluginStyledComponents(), pluginSass()],
  output: {
    sourceMap: {
      js: 'cheap-module-source-map',
      css: true
    }
  },
  html: {
    title: 'Bruno lazer'
  },
  server: {
    open: false,
    publicDir: {
      name: 'public',
      copyOnBuild: true
    }
  }
});
