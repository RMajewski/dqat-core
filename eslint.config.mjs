// eslint.config.mjs
import js from '@eslint/js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptEslintParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';
import sonarjs from 'eslint-plugin-sonarjs';

const fileName = fileURLToPath(import.meta.url);
const directoryName = path.dirname(fileName);

const isTypeAware = process.env.ESLINT_TYPEAWARE === '1';

const deploymentEnvironment =
  process.env.NUXT_PUBLIC_DEPLOYMENT_ENVIRONMENT ?? 'development';

const consoleRuleByEnvironment = {
  production: 'error',
  qa: ['error', { allow: ['warn', 'error'] }],
  testing: ['error', { allow: ['warn', 'error'] }],
};

const noConsoleRule = consoleRuleByEnvironment[deploymentEnvironment] ?? 'off';

// Regeln, die OHNE Type-Info laufen
const commonTypeScriptRules = {
  // Kernregeln, die durch TS-Variante ersetzt werden
  'no-unused-vars': 'off',
  'no-undef': 'off',

  // TS-Variante
  '@typescript-eslint/no-unused-vars': [
    'warn',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
  ],
  '@typescript-eslint/consistent-type-imports': [
    'warn',
    {
      disallowTypeAnnotations: false,
      prefer: 'type-imports',
    },
  ],
  '@typescript-eslint/explicit-function-return-type': [
    'warn',
    {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
    },
  ],
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/ban-ts-comment': [
    'error',
    {
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': 'allow-with-description',
      // Wichtig: laut neuem Schema -> boolean TRUE, damit dein ursprünglicher Fehler weg bleibt
      'ts-nocheck': true,
      'ts-check': false,
      minimumDescriptionLength: 8,
    },
  ],

  // env-abhängig
  'no-console': noConsoleRule,
};

// Regeln, die TYPE-INFO BRAUCHEN -> nur aktivieren, wenn isTypeAware=true
const typedOnlyRulesOn = {
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-misused-promises': [
    'error',
    { checksVoidReturn: { attributes: false } },
  ],
  '@typescript-eslint/prefer-nullish-coalescing': [
    'warn',
    { ignoreTernaryTests: true },
  ],
  '@typescript-eslint/prefer-optional-chain': 'error',
};

// Gleiche Keys explizit AUS, wenn nicht type-aware (verhindert den aktuellen Fehler)
const typedOnlyRulesOff = {
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/no-misused-promises': 'off',
  '@typescript-eslint/prefer-nullish-coalescing': 'off',
  '@typescript-eslint/prefer-optional-chain': 'off',
};

const sonarJsRules = {
  ...sonarjs.configs.recommended.rules,
  'sonarjs/cognitive-complexity': ['error', 10],
  'sonarjs/no-duplicate-string': ['error', { threshold: 5 }],
  'sonarjs/no-identical-functions': 'error',
  'sonarjs/no-nested-switch': 'error',
  'sonarjs/no-small-switch': 'error',
  'sonarjs/prefer-immediate-return': 'error',
  'sonarjs/todo-tag': 'warn',
};

export default [
  // Ignorieren von Build-/Coverage-Ordnern
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.output/**',
      '**/coverage/**',
      'data/**',
    ],
  },

  // Basis-Kernregeln von ESLint
  js.configs.recommended,

  // 1) JS/MJS/CJS (inkl. Konfig-Files) -> KEIN project, also kein Type-Aware für diese Dateien
  {
    files: [
      '**/eslint.config.*',
      '**/*.config.{js,mjs,cjs}',
      '**/*.conf.{js,mjs,cjs}',
    ],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      sonarjs,
    },
    rules: {
      ...commonTypeScriptRules,
      ...typedOnlyRulesOff,
      ...sonarJsRules,
    },
  },

  // 2) TS/TSX/CTS/MTS -> mit optionalem Type-Aware
  {
    files: ['**/*.{ts,tsx,cts,mts}'],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ...(isTypeAware
          ? {
              project: ['./tsconfig.eslint.json'],
              tsconfigRootDir: directoryName,
            }
          : {}),
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      sonarjs,
    },
    rules: {
      ...commonTypeScriptRules,
      ...(isTypeAware ? typedOnlyRulesOn : typedOnlyRulesOff),
      ...sonarJsRules,
    },
  },
  {
    files: ['**/*.service.ts', '**/*.controller.ts', '**/*.module.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'no-type-imports',
        },
      ],
    },
  },
  {
    plugins: { prettier },
    rules: {
      ...eslintConfigPrettier.rules,
      'prettier/prettier': 'error',
    },
  },
];
