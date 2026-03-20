import js from '@eslint/js';

export default [
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        FileReader: 'readonly',
        HTMLElement: 'readonly',
        Event: 'readonly',
        PointerEvent: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        Promise: 'readonly',
        Map: 'readonly',
        Set: 'readonly',
        getComputedStyle: 'readonly',
        crypto: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,

      // ── Core JS quality ─────────────────────────────────────────
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'no-alert': 'off',
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'warn',

      // ── Project convention: state via setState() ────────────────
      'no-restricted-syntax': [
        'warn',
        {
          selector: "AssignmentExpression[left.object.name='STATE'][left.type='MemberExpression']",
          message:
            'Avoid mutating STATE directly. Use setState(s => { ... }) instead. ' +
            'If this is migration logic in loadState(), add an inline eslint-disable comment.',
        },
        {
          selector: "CallExpression[callee.name='eval']",
          message: 'eval() is banned. Find a safer alternative.',
        },
        {
          selector: "NewExpression[callee.name='Function']",
          message: 'new Function() is banned. Find a safer alternative.',
        },
        {
          selector: 'AssignmentExpression[left.property.name=/^on[a-z]/]',
          message: 'Prefer addEventListener() over .onXxx property assignment ' + '(see docs/vanilla-js-patterns.md).',
        },
      ],

      // ── Ban dangerous globals ───────────────────────────────────
      'no-restricted-globals': [
        'error',
        {
          name: 'React',
          message: 'No frameworks. This is a vanilla JS project (CLAUDE.md rule #2).',
        },
        {
          name: 'ReactDOM',
          message: 'No frameworks. This is a vanilla JS project (CLAUDE.md rule #2).',
        },
        {
          name: 'Vue',
          message: 'No frameworks. This is a vanilla JS project (CLAUDE.md rule #2).',
        },
        {
          name: 'Alpine',
          message: 'No frameworks. This is a vanilla JS project (CLAUDE.md rule #2).',
        },
      ],

      // ── Safety ──────────────────────────────────────────────────
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-properties': [
        'warn',
        {
          object: 'element',
          property: 'innerHTML',
          message:
            'innerHTML with user data risks XSS. Use textContent or DOM APIs for ' +
            'user-supplied content. Static HTML strings are OK — add inline disable comment.',
        },
      ],

      // ── Code style enforced by convention docs ──────────────────
      'max-depth': ['warn', 6],
      'max-params': ['warn', 5],
    },
  },
  {
    // Config files at root level
    files: ['*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
  {
    ignores: ['node_modules/', '.vercel/', 'dist/'],
  },
];
