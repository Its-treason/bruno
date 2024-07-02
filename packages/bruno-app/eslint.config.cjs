// @ts-check

const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const reactCompiler = require('eslint-plugin-react-compiler');

module.exports = tseslint.config(tseslint.configs.base, {
  files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  ignores: ['node_modules/*'],
  plugins: { 'react-compiler': reactCompiler },
  rules: {
    'react-compiler/react-compiler': 'error'
  }
});
