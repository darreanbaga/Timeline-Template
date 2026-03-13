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
      // Relax rules that conflict with the single-file IIFE pattern
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "no-alert": "off",
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "warn",
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
