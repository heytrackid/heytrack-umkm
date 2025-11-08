// ESLint configuration for HeyTrack project
// Strict, cepat di dev, type-aware hanya di CI

import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import promise from "eslint-plugin-promise";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import ts from "typescript-eslint";
import heytrackPlugin from "./eslint-plugin-heytrack.js";

const typeAware = false;

export default [
  js.configs.recommended,
  ...ts.configs.recommended,

  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: ts.parser,
      parserOptions: {
        // Cepat saat dev, ketat saat CI
        project: typeAware ? ["tsconfig.eslint.json"] : false,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "@typescript-eslint": ts.plugin,
      import: importPlugin,
      "jsx-a11y": jsxA11y,
      promise,
      heytrack: heytrackPlugin,
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: {
          // Dev: kurangi IO, CI: lebih ketat
          alwaysTryTypes: typeAware,
        },
      },
    },

    rules: {
      // ============================================
      // CORE JAVASCRIPT RULES
      // ============================================
      "no-console": "error",
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": ["error", { allowNamedFunctions: false }],
      "prefer-template": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-return-await": "error",
      "require-await": "error",
      "no-throw-literal": "error",
      "no-unused-expressions": [
        "error",
        { allowShortCircuit: true, allowTernary: true },
      ],
      "no-useless-concat": "error",
      "no-useless-return": "error",
      "no-useless-catch": "error",
      "no-prototype-builtins": "error",
      "no-control-regex": "error",
      "no-empty-pattern": "error",
      "no-duplicate-imports": "error",
       "no-nested-ternary": "error",
      "no-unneeded-ternary": "error",
      "object-shorthand": ["error", "always"],
      "prefer-destructuring": ["error", { array: false, object: true }],
      yoda: "error",
      "no-lonely-if": "error",
      "no-else-return": ["error", { allowElseIf: false }],
      "default-case": "error",
      "default-case-last": "error",
      "no-implicit-coercion": "error",
      "prefer-exponentiation-operator": "error",
      "prefer-numeric-literals": "error",
      "no-param-reassign": "error",
      "prefer-rest-params": "error",
      "prefer-spread": "error",

      // ============================================
      // TYPESCRIPT RULES
      // ============================================
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
       "@typescript-eslint/no-inferrable-types": "error",
        "@typescript-eslint/no-type-alias": "off",
        "@typescript-eslint/no-useless-empty-export": "error",
        // Ringan dan berguna
        "@typescript-eslint/explicit-function-return-type": "error",
        "@typescript-eslint/no-use-before-define": [
          "error",
          { functions: false, classes: true, variables: true },
        ],
        "@typescript-eslint/consistent-indexed-object-style": ["error", "record"],
        "@typescript-eslint/method-signature-style": ["error", "property"],

        // Ketat type-aware (aktif hanya di CI)
        ...(typeAware
          ? {
              "@typescript-eslint/no-floating-promises": "error",
              "@typescript-eslint/await-thenable": "error",
              "@typescript-eslint/no-unsafe-declaration-merging": "error",
              "@typescript-eslint/no-empty-object-type": "error",
              "@typescript-eslint/no-misused-promises": [
                "error",
                { checksVoidReturn: false },
              ],
              "@typescript-eslint/strict-boolean-expressions": "error",
              "@typescript-eslint/no-unnecessary-type-assertion": "error",
              "@typescript-eslint/prefer-nullish-coalescing": "error",
              "@typescript-eslint/prefer-optional-chain": "error",
              "@typescript-eslint/no-non-null-assertion": "error",
              "@typescript-eslint/prefer-readonly": "error",
              "@typescript-eslint/no-meaningless-void-operator": "error",
              "@typescript-eslint/no-redundant-type-constituents": "error",
              "@typescript-eslint/prefer-enum-initializers": "error",
              "@typescript-eslint/prefer-literal-enum-member": "error",
              "@typescript-eslint/prefer-return-this-type": "error",
              "@typescript-eslint/prefer-ts-expect-error": "error",
              "@typescript-eslint/require-array-sort-compare": "error",
              "@typescript-eslint/sort-type-constituents": "error",
              "@typescript-eslint/switch-exhaustiveness-check": "error",
              "@typescript-eslint/triple-slash-reference": "error",
              "@typescript-eslint/restrict-template-expressions": [
                "error",
                { allowNumber: true, allowBoolean: true, allowNullish: true },
              ],
              "@typescript-eslint/ban-ts-comment": [
                "error",
                {
                  "ts-expect-error": "allow-with-description",
                  "ts-ignore": true,
                  "ts-nocheck": true,
                  minimumDescriptionLength: 10,
                },
              ],
            }
          : {}),

      // ============================================
      // REACT RULES
      // ============================================
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "off",
      "react/jsx-no-target-blank": "error",
      "react/jsx-key": [
        "error",
        { checkFragmentShorthand: true, checkKeyMustBeforeSpread: true },
      ],
      "react/jsx-curly-brace-presence": [
        "error",
        { props: "never", children: "never", propElementValues: "always" },
      ],
      "react/self-closing-comp": "error",
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
      "react/jsx-pascal-case": "error",
      "react/no-array-index-key": "off",
      "react/no-danger": "error",
      "react/no-unstable-nested-components": "error",
      "react/jsx-no-constructed-context-values": "error",
      "react/no-multi-comp": "error",
      "react/function-component-definition": [
        "error",
        { namedComponents: "arrow-function", unnamedComponents: "arrow-function" },
      ],
      "react/no-children-prop": "error",

      // ============================================
      // REACT HOOKS RULES
      // ============================================
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",

      // ============================================
      // A11Y & PROMISE
      // ============================================
      "jsx-a11y/anchor-is-valid": "error",
      "promise/always-return": "error",
      "promise/no-return-wrap": "error",

      // ============================================
      // HEYTRACK CUSTOM RULES
      // ============================================
      "heytrack/consistent-error-handling": "error",
      "heytrack/no-console-usage": "error",

      // ============================================
      // CODE STYLE & CONSISTENCY
      // ============================================
      "arrow-body-style": ["error", "as-needed"],
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration",
          message: "Use const objects or union types instead of enums",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../*", "../../../*"],
              message:
                "Use absolute imports with @ alias instead of relative imports",
            },
          ],
        },
      ],
      "no-await-in-loop": "error",
      "prefer-object-has-own": "error",
      "prefer-object-spread": "error",
      "prefer-regex-literals": "error",
      complexity: ["error", 14],
      "max-depth": ["error", 4],
      "max-lines-per-function": ["error", 250],
      "max-params": ["error", 5],
      "max-statements": ["error", 40],

      // ============================================
      // IMPORT RULES
      // ============================================
       "import/order": [
         "error",
         {
           groups: [
             "builtin",
             "external",
             "internal",
             "parent",
             "sibling",
             "index",
             "object",
             "type",
           ],
           "newlines-between": "always-and-inside-groups",
           alphabetize: { order: "asc", caseInsensitive: true },
           pathGroups: [{ pattern: "@/**", group: "internal", position: "after" }],
           pathGroupsExcludedImportTypes: ["builtin"],
         },
       ],
      "import/no-unresolved": "error",
      "import/no-deprecated": "error",
      "import/no-extraneous-dependencies": "error",

      // Berat, aktifkan hanya di CI
      ...(typeAware
        ? {
            "import/no-cycle": "error",
            "import/no-unused-modules": "error",
          }
        : {}),

      // ============================================
      // SECURITY RULES
      // ============================================
      "no-script-url": "error",
      "react/jsx-no-script-url": "error",
    },
  },

  // ============================================
  // API ROUTES SPECIFIC RULES
  // ============================================
  {
    files: ["src/app/api/**/*.ts"],
    rules: {
      "@typescript-eslint/no-floating-promises": typeAware ? "error" : "off",
      "require-await": "error",
      complexity: "off",
      "max-statements": "off",
      "max-lines-per-function": "off",
      "max-params": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // ============================================
  // PRODUCTION & OPERATIONAL COSTS MODULES
  // ============================================
  {
    files: [
      "src/app/production/**/*.{ts,tsx}",
      "src/components/operational-costs/**/*.{ts,tsx}",
    ],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
      "react/no-multi-comp": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },

  // ============================================
  // AUTH MODULES
  // ============================================
  {
    files: ["src/app/auth/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },

  // ============================================
  // CASH FLOW MODULE
  // ============================================
  {
    files: ["src/app/cash-flow/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
      "react/no-multi-comp": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-use-before-define": "off",
    },
  },

  // ============================================
  // CUSTOMERS MODULE
  // ============================================
  {
    files: ["src/app/customers/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
      "react/no-multi-comp": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-use-before-define": "off",
    },
  },

  // ============================================
  // DASHBOARD MODULE
  // ============================================
  {
    files: ["src/app/dashboard/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
      "react/no-multi-comp": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-use-before-define": "off",
    },
  },

  // ============================================
  // CATEGORIES MODULE
  // ============================================
  {
    files: ["src/app/categories/**/*.{ts,tsx}"],
    rules: {
      "react/no-multi-comp": "off",
      "max-lines-per-function": "off",
      complexity: "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },

  // ============================================
  // HPP MODULE
  // ============================================
  {
    files: ["src/app/hpp/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
      "react/no-multi-comp": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-use-before-define": "off",
    },
  },

  // ============================================
  // INGREDIENTS MODULE
  // ============================================
  {
    files: ["src/app/ingredients/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
      "react/no-multi-comp": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-use-before-define": "off",
    },
  },

  // ============================================
  // ORDERS MODULE
  // ============================================
  {
    files: ["src/app/orders/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
      "react/no-multi-comp": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "max-depth": "off",
    },
  },

  // ============================================
  // PROFIT MODULE
  // ============================================
  {
    files: ["src/app/profit/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
      "react/no-multi-comp": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },

  // ============================================
  // RECIPES MODULE
  // ============================================
  {
    files: ["src/app/recipes/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
      "react/no-multi-comp": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-use-before-define": "off",
    },
  },

  // ============================================
  // REPORTS MODULE
  // ============================================
  {
    files: ["src/app/reports/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
      "react/no-multi-comp": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },

  // ============================================
  // SETTINGS MODULE
  // ============================================
  {
    files: ["src/app/settings/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-use-before-define": "off",
    },
  },

  // ============================================
  // SUPPLIERS MODULE
  // ============================================
  {
    files: ["src/app/suppliers/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },

  // ============================================
  // SHARED COMPONENTS
  // ============================================
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
      "react/no-multi-comp": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "react/jsx-no-constructed-context-values": "off",
    },
  },

  // ============================================
  // FEATURE MODULES (src/modules)
  // ============================================
  {
    files: ["src/modules/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
      "react/no-multi-comp": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "default-case": "off",
      "no-await-in-loop": "off",
      "max-params": "off",
    },
  },

  // ============================================
  // PROVIDERS
  // ============================================
  {
    files: ["src/providers/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "react/no-multi-comp": "off",
      "react/jsx-no-constructed-context-values": "off",
    },
  },

  // ============================================
  // DOMAIN SERVICES
  // ============================================
  {
    files: ["src/services/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "max-lines-per-function": "off",
      complexity: "off",
      "max-depth": "off",
      "max-params": "off",
      "no-await-in-loop": "off",
      "promise/no-return-wrap": "off",
      "require-await": "off",
    },
  },

  // ============================================
  // TYPES
  // ============================================
  {
    files: ["src/types/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      complexity: "off",
    },
  },

  // ============================================
  // UTILS & WORKERS
  // ============================================
  {
    files: ["src/utils/**/*.{ts,tsx}", "src/workers/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "max-lines-per-function": "off",
      complexity: "off",
    },
  },

  // ============================================
  // ENHANCED CRUD MODULE
  // ============================================
  {
    files: ["src/hooks/enhanced-crud/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },

  // ============================================
  // CONTEXTS
  // ============================================
  {
    files: ["src/contexts/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "react/jsx-no-constructed-context-values": "off",
    },
  },

  // ============================================
  // SHARED HOOKS
  // ============================================
  {
    files: ["src/hooks/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "react/jsx-no-constructed-context-values": "off",
      "no-await-in-loop": "off",
    },
  },

  // ============================================
  // CORE LIBS
  // ============================================
  {
    files: ["src/lib/**/*.{ts,tsx}"],
    rules: {
      "max-lines-per-function": "off",
      "max-statements": "off",
      complexity: "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "no-await-in-loop": "off",
    },
  },

  // ============================================
  // SUPABASE HOOKS
  // ============================================
  {
    files: ["src/hooks/supabase/useSupabaseCRUD.ts"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
    },
  },

  // ============================================
  // SERVER COMPONENTS RULES
  // ============================================
  {
    files: ["src/app/**/page.tsx", "src/app/**/layout.tsx"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },

  // ============================================
  // IGNORE PATTERNS
  // ============================================
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".tmp/**",
      "out/**",
      "build/**",
      "dist/**",
      ".git/**",
      "eslint.config.js",
      "*.cjs",
      "*.config.js",
      "*.config.ts",
      "supabase/**",
      "scripts/**",
      "public/**",
      "docs/**",
      "eslint-rules/**",
      ".kiro/**",
      "workers/**",
      "src/types/supabase-generated.ts",
      "src/**/__generated__/**",
      "**/__tests__/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "fix-*.js",
      "fix-*.mjs",
      "eslint-plugin-*.js",
      "test-*.js",
      "test-*.mjs",
      "*.test.js",
    ],
  },
];
