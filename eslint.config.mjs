import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig({
  files: ['src/**/.*ts', 'src/**/*.js', 'types/**/*.ts'],
  extends: [eslint.configs.recommended, tseslint.configs.recommended],
});
