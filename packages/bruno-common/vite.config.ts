import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'index',
      fileName: 'index',
      formats: ['es', 'cjs']
    }
  },
  clearScreen: false
});
