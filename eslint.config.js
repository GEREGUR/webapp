// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { resolve } from 'path';

export default tseslint.config(
  {
    files: ['src/**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    plugins: {
      react,
      'react-hooks': reactHooks
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        alias: {
          map: [
            ['@/app', resolve('./src/app')],
            ['@/pages', resolve('./src/pages')],
            ['@/widgets', resolve('./src/widgets')],
            ['@/features', resolve('./src/features')],
            ['@/entities', resolve('./src/entities')],
            ['@/shared', resolve('./src/shared')],
          ],
          extensions: ['.ts', '.tsx', '.js', '.jsx']
        }
      }
    },
    rules: {
      '@typescript-eslint/no-unused-expressions': 0,
    },
  }
);