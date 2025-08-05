const parser = require('@typescript-eslint/parser');
const pluginTs = require('@typescript-eslint/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('./.prettierrc.json');

module.exports = {
  ignores: ['dist/**'],

  plugins: {
    '@typescript-eslint': pluginTs,
    prettier: prettierPlugin,
  },

  languageOptions: {
    parser,
    parserOptions: {
      project: ['./tsconfig.json'],
      sourceType: 'module',
    },
  },

  rules: {
    ...pluginTs.configs.recommended.rules,
    'prettier/prettier': ['error', prettierConfig],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },

  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
    },
  ],
};
