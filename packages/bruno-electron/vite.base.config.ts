import { builtinModules } from 'node:module';
import type { ConfigEnv, UserConfig } from 'vite';
import pkg from './package.json';
import { execSync } from 'child_process';

export const builtins = ['electron', ...builtinModules.map((m) => [m, `node:${m}`]).flat()];

export const external = [
  ...builtins,
  ...Object.keys('dependencies' in pkg ? (pkg.dependencies as Record<string, unknown>) : {})
];

// Get the latest commit hash
const getLatestCommitHash = () => {
  try {
    // https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables#default-environment-variables
    if (process.env.GITHUB_SHA) {
      return process.env.GITHUB_SHA.slice(0, 7);
    }

    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch (error) {
    console.warn('Failed to get git commit hash', error);
    return 'Unknown';
  }
};

export function getBuildConfig(env: ConfigEnv): UserConfig {
  const { mode } = env;

  return {
    define: {
      BRUNO_VERSION: JSON.stringify(pkg.version || ''), // from ./package.json
      BRUNO_COMMIT: JSON.stringify(getLatestCommitHash()) // latest commit hash
    },
    mode,
    build: {
      // Prevent multiple builds from interfering with each other.
      emptyOutDir: false,
      // 🚧 Multiple builds may conflict.
      outDir: '.vite/build',
      minify: false,
      sourcemap: true
    },
    clearScreen: false
  };
}
