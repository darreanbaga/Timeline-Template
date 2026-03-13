import js from "@eslint/js";
import html from "eslint-plugin-html";

export default [
  {
    // Extract and lint JS from <script> tags in HTML files
    files: ["**/*.html"],
    plugins: { html },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        URL: "readonly",
        Blob: "readonly",
        FileReader: "readonly",
        HTMLElement: "readonly",
        Event: "readonly",
        PointerEvent: "readonly",
        MouseEvent: "readonly",
        KeyboardEvent: "readonly",
        MutationObserver: "readonly",
        ResizeObserver: "readonly",
        Promise: "readonly",
        Map: "readonly",
        Set: "readonly",
        getComputedStyle: "readonly",
        crypto: "readonly",
        // html2canvas is loaded in a prior script block
        html2canvas: "readonly",
      },
    },
    rules: {
      ...js.configs.recommended.rules,

      // ── Core JS quality ─────────────────────────────────────────
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "no-alert": "off",
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "warn",

      // ── Project convention: state via setState() ────────────────
      // Warn on direct STATE property assignment (e.g. STATE.items = ...).
      // Legitimate uses exist in loadState() migration logic — suppress
      // with an inline eslint-disable comment when justified.
      "no-restricted-syntax": [
        "warn",
        {
          selector: "AssignmentExpression[left.object.name='STATE'][left.type='MemberExpression']",
          message:
            "Avoid mutating STATE directly. Use setState(s => { ... }) instead. " +
            "If this is migration logic in loadState(), add an inline eslint-disable comment.",
        },
        // Ban eval and Function constructor — security + single-file hygiene
        {
          selector: "CallExpression[callee.name='eval']",
          message: "eval() is banned. Find a safer alternative.",
        },
        {
          selector: "NewExpression[callee.name='Function']",
          message: "new Function() is banned. Find a safer alternative.",
        },
        // Ban inline onclick/onXxx property assignment — use addEventListener
        // (see docs/vanilla-js-patterns.md § Event Listener Conventions).
        // Existing modal code uses .onclick for brevity; new code should prefer
        // addEventListener. Suppress with inline comment when justified.
        {
          selector: "AssignmentExpression[left.property.name=/^on[a-z]/]",
          message:
            "Prefer addEventListener() over .onXxx property assignment " +
            "(see docs/vanilla-js-patterns.md).",
        },
      ],

      // ── Ban dangerous globals ───────────────────────────────────
      // No frameworks allowed (CLAUDE.md rule #2)
      "no-restricted-globals": [
        "error",
        {
          name: "React",
          message: "No frameworks. This is a vanilla JS project (CLAUDE.md rule #2).",
        },
        {
          name: "ReactDOM",
          message: "No frameworks. This is a vanilla JS project (CLAUDE.md rule #2).",
        },
        {
          name: "Vue",
          message: "No frameworks. This is a vanilla JS project (CLAUDE.md rule #2).",
        },
        {
          name: "Alpine",
          message: "No frameworks. This is a vanilla JS project (CLAUDE.md rule #2).",
        },
      ],

      // ── Safety ──────────────────────────────────────────────────
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      // innerHTML is used in existing modal code with static strings.
      // Warn so new usage is reviewed for XSS when user-supplied data is involved.
      "no-restricted-properties": [
        "warn",
        {
          object: "element",
          property: "innerHTML",
          message:
            "innerHTML with user data risks XSS. Use textContent or DOM APIs for " +
            "user-supplied content. Static HTML strings are OK — add inline disable comment.",
        },
      ],

      // ── Code style enforced by convention docs ──────────────────
      // Catch accidental nested functions that could bloat the single-file IIFE
      "max-depth": ["warn", 6],
      // Flag overly complex functions that should be broken up
      "max-params": ["warn", 5],

      // ────────────────────────────────────────────────────────────
      // MANUAL REVIEW REQUIRED — conventions that can't be auto-linted:
      //
      // 1. Design tokens over raw values (CLAUDE.md #5, docs/styling-conventions.md)
      //    CSS is not linted by ESLint. Verify no hard-coded #hex/rgb() in <style>.
      //
      // 2. html2canvas export fidelity (CLAUDE.md #6)
      //    No lint rule can test visual output. Manually verify PNG export after
      //    any CSS or DOM structure change.
      //
      // 3. localStorage schema migration (CLAUDE.md #7)
      //    Changing the STATE shape requires migration logic in loadState().
      //    No lint rule can verify data compatibility.
      //
      // 4. render() idempotency (CLAUDE.md #4, docs/vanilla-js-patterns.md)
      //    render() must produce identical DOM when called twice with same state.
      //    Not statically verifiable.
      //
      // 5. Primitive tokens (--_X###) never used directly in component CSS
      //    (docs/styling-conventions.md). Only semantic tokens (--color-*)
      //    should appear in component rules. Requires manual CSS review.
      //
      // 6. Track assignment via findFreeTrack() (docs/vanilla-js-patterns.md)
      //    New items must use findFreeTrack() to avoid overlapping bars.
      //    Not statically verifiable.
      // ────────────────────────────────────────────────────────────
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
  {
    ignores: ["node_modules/", ".vercel/"],
  },
];
