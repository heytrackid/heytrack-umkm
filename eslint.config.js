import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    ignores: [
      ".next/**",
      ".turbo/**",
      "node_modules/**",
      "coverage/**",
      ".tmp/**",
      "scripts/**",
      "public/**",
      "supabase/**",
      "*.config.js",
      "*.config.ts",
      "next.config.*",
      "vitest.config.ts",
      "check-*.js",
      "**/*.worker.ts",
      "**/*.worker.js",
      "**/__tests__/**",
      "**/*.test.*",
      "**/*.spec.*",
      "ts-errors.txt",
      "COMMIT_MESSAGE.txt",
      "*.md",
      "**/*.cjs",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        JSX: "readonly",
        React: "readonly",
        NodeJS: "readonly",
        BodyInit: "readonly",
        RequestInit: "readonly",
        Response: "readonly",
        EventListener: "readonly",
        IntersectionObserverInit: "readonly",
        IdleRequestCallback: "readonly",
        IdleRequestOptions: "readonly",
        ScrollBehavior: "readonly",
        ScrollLogicalPosition: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
       ...react.configs.recommended.rules,
       "react/prop-types": "off",
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
       "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
       "@typescript-eslint/no-explicit-any": "error",
       "react-hooks/exhaustive-deps": "warn",
       "react-hooks/incompatible-library": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },
];