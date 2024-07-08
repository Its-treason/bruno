import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginStyledComponents } from '@rsbuild/plugin-styled-components';
import { pluginSass } from '@rsbuild/plugin-sass';

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
    open: false
  }
});
