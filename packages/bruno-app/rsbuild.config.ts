import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginStyledComponents } from '@rsbuild/plugin-styled-components';
import { pluginSass } from '@rsbuild/plugin-sass';
import { cpSync } from 'node:fs';
import { resolve } from 'path';

cpSync(resolve(__dirname, '../../node_modules/monaco-editor/min/vs'), resolve(__dirname, './public/vs'), {
  recursive: true
});

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
