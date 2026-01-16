// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'esbuild.config.mjs',
      'dist/**',
      'node_modules/**',
      'coverage/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // ============================================
      // TYPESCRIPT RULES
      // ============================================
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',

      // ============================================
      // IMPORT ORDERING & ORGANIZATION
      // ============================================
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. Side effect imports (e.g., 'reflect-metadata')
            ['^\\u0000'],

            // 2. Node.js built-in modules
            ['^node:'],
            [
              '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)',
            ],

            // 3. External packages - NestJS core first
            ['^@nestjs/common', '^@nestjs/core'],

            // 4. External packages - Other NestJS packages
            ['^@nestjs/'],

            // 5. External packages - Apollo/GraphQL
            ['^@apollo/', '^graphql', '^@graphql'],

            // 6. External packages - Prisma
            ['^@prisma/', '^prisma'],

            // 7. External packages - All other @scoped packages
            ['^@\\w'],

            // 8. External packages - Non-scoped packages
            ['^[a-z]'],

            // 9. Internal packages - Absolute imports from src/
            ['^@/', '^~/', '^src/'],

            // 10. Parent imports (..)
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],

            // 11. Sibling imports (./something)
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],

            // 12. Style imports (if any)
            ['^.+\\.s?css$'],

            // 13. Type imports (separated at the end)
            ['^.*\\u0000$'],
          ],
        },
      ],

      // Sort exports alphabetically
      'simple-import-sort/exports': 'error',

      // ============================================
      // GENERAL CODE QUALITY
      // ============================================
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-duplicate-imports': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ForInStatement',
          message:
            'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
        },
      ],
    },
  },
);
