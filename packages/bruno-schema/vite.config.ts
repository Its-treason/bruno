import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts()],
  build: {
    minify: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@usebruno/schema',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['zod']
    }
  },
  clearScreen: false
});
