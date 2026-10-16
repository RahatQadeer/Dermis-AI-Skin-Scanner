import eslint from '@eslint/js';
import eslintConfigExpo from 'eslint-config-expo/flat.js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
const sizeLimits = [
  {
    rules: {
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 10],
      'max-params': ['error', 4],
      'max-depth': ['error', 4],
    },
  },
];

/** Path aliases validated by `tsc`; import resolver does not always match Expo tsconfig paths. */
const mobileImports = [
  {
    files: ['apps/mobile/**/*.{ts,tsx}'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
];

/** User-visible JSX text must come from src/copy (DERM-004). */
const noInlineUiCopy = [
  {
    files: ['apps/mobile/app/**/*.tsx', 'apps/mobile/src/components/**/*.tsx'],
    ignores: ['apps/mobile/src/copy/**'],
    rules: {
      'react/jsx-no-literals': [
        'error',
        {
          noStrings: true,
          allowedStrings: [],
          ignoreProps: true,
        },
      ],
    },
  },
];

/** Hex colours only allowed in the theme colours module (DERM-003). */
const noHardCodedHex = [
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/src/theme/colors.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'Literal[value=/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/]',
          message: 'Use theme tokens from src/theme/colors.ts — no hard-coded hex.',
        },
      ],
    },
  },
];

export default tseslint.config(
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: [
            'apps/mobile/tsconfig.json',
            'packages/domain/tsconfig.json',
            'backend/tsconfig.json',
          ],
        },
      },
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/.expo/**',
      '**/dist/**',
      'tools/eslint-fixtures/**',
      'eslint.config.mjs',
      'scripts/**',
      '**/*.test.ts',
      'packages/domain/scripts/**',
    ],
  },
  eslint.configs.recommended,
  ...eslintConfigExpo,
  ...tseslint.configs.recommended,
  ...sizeLimits,
  ...mobileImports,
  ...noInlineUiCopy,
  ...noHardCodedHex,
  eslintConfigPrettier,
);
