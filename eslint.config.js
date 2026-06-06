import js from '@eslint/js';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node
    },
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      ...js.configs.recommended.rules,
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/quotes': ['error', 'single']
    }
  }
]);