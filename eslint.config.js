// ESLint flat config (ESLint v9). Encodes the constitution's architecture rules
// as mechanical lint rules so violations fail the build, not just review.
// Source of truth for the rules: docs/constitution.md + docs/architecture.md.
// Tool config files legitimately use `export default` / node globals, so the
// application-code guards are scoped to `src/**` and never touch this file.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

// Constitution: no runtime network calls — the app must work fully offline.
const NO_NETWORK =
  'No runtime network calls allowed — the app must work fully offline (constitution).';
// Constitution: named exports only (except where a tool config requires default).
const NAMED_EXPORTS =
  'Named exports only (constitution) — no `default export` in application code.';
// Constitution: UI text is German, centralized in src/strings/, never inline.
const GERMAN_LITERAL =
  'Non-ASCII (umlaut/ß) literal found — move all UI text to src/strings/ (partial backstop for the centralized-strings rule).';

// `no-restricted-syntax` fully replaces (not merges) its options across configs,
// so the shared selectors are defined once and spread into each block that needs
// them, avoiding a later block silently dropping earlier selectors.
const noNetworkSyntax = [
  {
    selector: "NewExpression[callee.name='XMLHttpRequest']",
    message: NO_NETWORK,
  },
  {
    selector: "MemberExpression[object.name='window'][property.name='fetch']",
    message: NO_NETWORK,
  },
  {
    selector:
      "MemberExpression[object.name='window'][property.name='XMLHttpRequest']",
    message: NO_NETWORK,
  },
];
const noDefaultExportSyntax = [
  { selector: 'ExportDefaultDeclaration', message: NAMED_EXPORTS },
];
const germanLiteralSyntax = [
  { selector: 'Literal[value=/[^\\u0000-\\u007F]/]', message: GERMAN_LITERAL },
  { selector: 'JSXText[value=/[^\\u0000-\\u007F]/]', message: GERMAN_LITERAL },
  {
    selector: 'TemplateElement[value.cooked=/[^\\u0000-\\u007F]/]',
    message: GERMAN_LITERAL,
  },
];

export default tseslint.config(
  // Never lint generated / vendored output.
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },

  // Base recommended rule sets for all linted files.
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Application source: browser globals + the universal constitution guards.
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      // TypeScript resolves identifiers; core `no-undef` only produces false
      // positives on type-only references (typescript-eslint guidance).
      'no-undef': 'off',
      'max-lines': [
        'error',
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
      'max-lines-per-function': [
        'error',
        { max: 50, skipBlankLines: true, skipComments: true },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: NO_NETWORK },
        { name: 'XMLHttpRequest', message: NO_NETWORK },
      ],
      'no-restricted-syntax': [
        'error',
        ...noNetworkSyntax,
        ...noDefaultExportSyntax,
      ],
    },
  },

  // Domain core: pure logic — no React/DOM imports, no explicit `any`.
  {
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              message:
                'src/core must not import React (constitution: pure domain logic, no UI deps).',
            },
            {
              name: 'react-dom',
              message:
                'src/core must not import react-dom (constitution: pure domain logic, no UI deps).',
            },
            {
              name: 'react-dom/client',
              message:
                'src/core must not import react-dom (constitution: pure domain logic, no UI deps).',
            },
          ],
          patterns: [
            {
              group: ['react', 'react/*', 'react-dom', 'react-dom/*'],
              message:
                'src/core must not import React/DOM (constitution: pure domain logic, no UI deps).',
            },
          ],
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  // UI code (features + app): universal guards PLUS the German-literal backstop.
  // src/strings/ is intentionally excluded — that is where German text lives.
  {
    files: ['src/features/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...noNetworkSyntax,
        ...noDefaultExportSyntax,
        ...germanLiteralSyntax,
      ],
    },
  },

  // Tool config files: node globals; `export default` is allowed here.
  {
    files: ['*.{js,ts}', '*.config.{js,ts}'],
    languageOptions: { globals: { ...globals.node } },
  },

  // Turn off stylistic rules that conflict with Prettier (run as a separate step).
  prettierConfig,
);
