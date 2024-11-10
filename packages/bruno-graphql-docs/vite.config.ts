import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), dts()],
  build: {
    minify: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['cjs', 'es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'graphql'],
      output: {
        // Ensure consistent global names
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        // Ensure consistent module format
        format: 'esm'
      }
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  clearScreen: false
});
