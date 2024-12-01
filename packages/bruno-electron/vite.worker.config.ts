import type { UserConfig } from 'vite';
import { defineConfig, mergeConfig } from 'vite';
import { external, getBuildConfig } from './vite.base.config';
import { resolve } from 'path';

export default defineConfig((env) => {
  const config: UserConfig = {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/worker/entrypoint.ts'),
        fileName: () => '[name].js',
        formats: ['cjs']
      },
      rollupOptions: {
        external
      }
    },
    resolve: {
      // Load the Node.js entry.
      mainFields: ['module', 'jsnext:main', 'jsnext']
    },
    plugins: []
  };

  return mergeConfig(getBuildConfig(env), config);
});
