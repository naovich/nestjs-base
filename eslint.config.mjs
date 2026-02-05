import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import sonarjs from 'eslint-plugin-sonarjs';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import promisePlugin from 'eslint-plugin-promise';
import jsdoc from 'eslint-plugin-jsdoc';
import unicorn from 'eslint-plugin-unicorn';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    ignores: [
      'node_modules/**',
      '*.config.ts',
      '*.config.js',
      '*.config.mjs',
      'dist/**',
      'coverage/**',
    ],
  },
  // Configuration for test files (Jest globals)
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts', 'test/**/*.ts'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
  },
  // Configuration for main.ts (NestJS bootstrap pattern)
  {
    files: ['src/main.ts'],
    rules: {
      'unicorn/prefer-top-level-await': 'off', // NestJS uses bootstrap function pattern
    },
  },
  // Configuration for Node.js scripts
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      'unicorn': unicorn,
    },
    rules: {
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-string-replace-all': 'error',
      'unicorn/prefer-number-properties': 'error',
      'unicorn/no-for-loop': 'error',
      'unicorn/prefer-top-level-await': 'error',
      'radix': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
    },
  },
  {
    files: ['**/*.ts'],
    ignores: ['scripts/**/*.ts'],
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'sonarjs': sonarjs,
      'import': importPlugin,
      'simple-import-sort': simpleImportSort,
      'promise': promisePlugin,
      'jsdoc': jsdoc,
      'unicorn': unicorn,
    },
    rules: {
      // TypeScript strict rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
      'no-unused-vars': 'off', // Disabled in favor of @typescript-eslint/no-unused-vars
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      
      // File quality rules
      'max-lines': ['error', {
        max: 500,
        skipBlankLines: true,
        skipComments: true,
      }],
      
      // SonarJS - Code quality rules
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/cyclomatic-complexity': 'error',
      'sonarjs/max-lines-per-function': 'warn',
      'sonarjs/nested-control-flow': 'error',
      'sonarjs/expression-complexity': 'warn',
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-collapsible-if': 'warn',
      'sonarjs/prefer-immediate-return': 'warn',
      'sonarjs/no-inconsistent-returns': 'warn',
      
      // General best practices
      'no-console': 'off', // NestJS uses console for logging
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'radix': 'error',
      'linebreak-style': ['error', 'unix'],
      
      // Import rules
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/no-duplicates': 'error',
      'import/no-cycle': 'error',
      'import/no-self-import': 'error',
      
      // Simple import sort
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      
      // Promise rules
      'promise/always-return': 'error',
      'promise/catch-or-return': 'error',
      'promise/no-nesting': 'warn',
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/valid-params': 'error',
      
      // JSDoc rules
      'jsdoc/require-jsdoc': ['warn', {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: false,
          ClassDeclaration: false,
          ArrowFunctionExpression: false,
          FunctionExpression: false,
        },
        publicOnly: true,
      }],
      'jsdoc/require-description': 'warn',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-returns-description': 'off',
      'jsdoc/check-alignment': 'warn',
      'jsdoc/check-indentation': 'warn',
      
      // Unicorn rules
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-string-replace-all': 'error',
      'unicorn/number-literal-case': 'error',
      'unicorn/prefer-number-properties': 'error',
      'unicorn/no-for-loop': 'error',
      'unicorn/prefer-top-level-await': 'error',
    },
  },
  prettier,
];
