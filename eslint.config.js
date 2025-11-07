// ESLint configuration for HeyTrack project
// Strict rules for TypeScript, React/Next.js, code quality, and consistency

import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import ts from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import heytrackPlugin from "./eslint-plugin-heytrack.js";

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: ts.parser,
      parserOptions: {
        // 🔒 STRICT MODE: Enable projectService for type-aware rules
        // Provides stricter type checking at the cost of slower linting
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "@typescript-eslint": ts.plugin,
      import: importPlugin,
      heytrack: heytrackPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      // ============================================
      // CORE JAVASCRIPT RULES
      // ============================================
      "no-console": "error", // Use logger from @/lib/logger instead
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
      "prefer-template": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-return-await": "error",
      "require-await": "error",
      "no-throw-literal": "error",
      "no-unused-expressions": ["error", { 
        allowShortCircuit: true, 
        allowTernary: true 
      }],
      "no-useless-concat": "error",
      "no-useless-return": "error",
      "no-useless-catch": "error",
      "no-prototype-builtins": "error",
      "no-control-regex": "error",
      "no-empty-pattern": "error",
      "no-duplicate-imports": "error",
       "no-nested-ternary": "warn",
      "no-unneeded-ternary": "error",
      "object-shorthand": ["error", "always"],
      "prefer-destructuring": ["error", {
        array: false,
        object: true,
      }],
      "yoda": "error",
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
          caughtErrorsIgnorePattern: "^_"
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { 
          prefer: "type-imports",
          fixStyle: "separate-type-imports"
        }
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
       "@typescript-eslint/no-inferrable-types": "error",
       "@typescript-eslint/no-unnecessary-type-assertion": "error",
       "@typescript-eslint/prefer-nullish-coalescing": "error",
       "@typescript-eslint/prefer-optional-chain": "error",
         "@typescript-eslint/no-non-null-assertion": "error",
         "@typescript-eslint/prefer-readonly": "off",
         // "@typescript-eslint/prefer-readonly-parameter-types": "error", // Disabled - causes crashes
        "@typescript-eslint/no-meaningless-void-operator": "error",
        "@typescript-eslint/no-redundant-type-constituents": "error",
        "@typescript-eslint/no-type-alias": "off", // Allow type aliases
        "@typescript-eslint/no-useless-empty-export": "error",
        "@typescript-eslint/prefer-enum-initializers": "error",
        "@typescript-eslint/prefer-literal-enum-member": "error",
        "@typescript-eslint/prefer-return-this-type": "error",

        "@typescript-eslint/prefer-ts-expect-error": "error",
        "@typescript-eslint/require-array-sort-compare": "error",
        "@typescript-eslint/sort-type-constituents": "error",
        "@typescript-eslint/switch-exhaustiveness-check": "error",
        "@typescript-eslint/triple-slash-reference": "error",
         "@typescript-eslint/no-unsafe-argument": "error",
         "@typescript-eslint/no-unsafe-assignment": "error",
         "@typescript-eslint/no-unsafe-member-access": "error",
         "@typescript-eslint/no-unsafe-return": "error",
       "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNumber: true,
          allowBoolean: true,
          allowNullish: true
        }
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
        // 🔒 STRICT MODE: Type-aware rules enabled for maximum code quality
        // These rules provide stricter type checking (linting will be slower)
        "@typescript-eslint/no-floating-promises": "warn",
       "@typescript-eslint/await-thenable": "error",
       "@typescript-eslint/no-unsafe-declaration-merging": "error",
       "@typescript-eslint/no-empty-object-type": "error",
       "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
         "@typescript-eslint/strict-boolean-expressions": "off",

      // ============================================
      // REACT RULES
      // ============================================
      "react/react-in-jsx-scope": "off", // Next.js handles this
      "react/prop-types": "off", // Using TypeScript
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "off",
      "react/jsx-no-target-blank": "error",
      "react/jsx-key": ["error", { 
        checkFragmentShorthand: true,
        checkKeyMustBeforeSpread: true,
      }],
      "react/jsx-curly-brace-presence": [
        "error", 
        { 
          props: "never", 
          children: "never",
          propElementValues: "always"
        }
      ],
      "react/self-closing-comp": "error",
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
      "react/jsx-pascal-case": "error",
      "react/no-array-index-key": "off", // Disabled - acceptable for static/skeleton content
      "react/no-danger": "error",
      "react/no-unstable-nested-components": "error",
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],

      // ============================================
      // REACT HOOKS RULES
      // ============================================
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",

        // ============================================
        // HEYTRACK CUSTOM RULES
        // ============================================
        "heytrack/consistent-error-handling": "error",
        "heytrack/no-console-usage": "error",

      // ============================================
      // CODE STYLE & CONSISTENCY
      // ============================================
      "arrow-body-style": ["error", "as-needed"],
      "prefer-arrow-callback": ["error", { allowNamedFunctions: false }],
      "no-restricted-syntax": [
        "error", // Enums are acceptable in some cases
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
              message: "Use absolute imports with @ alias instead of relative imports",
            },
          ],
        },
      ],

       "no-await-in-loop": "error",
       "prefer-object-has-own": "error",
       "prefer-object-spread": "error",
       "prefer-regex-literals": "error",

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
             "type"
           ],
           "newlines-between": "always",
           alphabetize: {
             order: "asc",
             caseInsensitive: true
           }
         }
       ],
       "import/no-unresolved": "error",
       "import/no-cycle": "error",
       "import/no-unused-modules": "error",

       // ============================================
       // SECURITY RULES
       // ============================================
       "no-eval": "error",
       "no-implied-eval": "error",
       "no-new-func": "error",
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
         "@typescript-eslint/no-floating-promises": "error",
         "require-await": "error",
       },
    },

  // ============================================
  // SERVER COMPONENTS RULES
  // ============================================
  {
    files: ["src/app/**/page.tsx", "src/app/**/layout.tsx"],
    rules: {
      "react-hooks/rules-of-hooks": "off", // Server components don't use hooks
    },
  },

  // ============================================
  // IGNORE PATTERNS
  // ============================================
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      ".git/**",
      "eslint.config.js",
      "*.cjs",
      "*.config.js",
      "*.config.ts",
      "supabase/functions/**", // Deno runtime
      "scripts/**",
      "public/**",
      "src/types/supabase-generated.ts", // Auto-generated
      "**/__tests__/**", // Test files
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
