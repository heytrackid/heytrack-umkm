// ESLint configuration for HeyTrack project
// Focus: TypeScript, React/Next.js, Hooks, and Logger enforcement

import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import ts from "typescript-eslint";

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      // Core rules
      "no-console": "error", // enforce using logger instead of console
      "no-unused-vars": "warn",
      "eqeqeq": "error",
      "curly": "error",
      "prefer-const": "error",
      "no-var": "error",

      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-uses-vars": "error",
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],

      // Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      ".git/**",
      "eslint.config.js",
    ],
  },
];
