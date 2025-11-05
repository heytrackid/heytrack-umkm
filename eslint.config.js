// ESLint configuration for HeyTrack project
// Strict rules for TypeScript, React/Next.js, code quality, and consistency

import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import ts from "typescript-eslint";
import consistentErrorHandling from "./eslint-rules/consistent-error-handling.js";

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
        // ⚡ PERFORMANCE: Disable projectService for faster linting
        // Type-aware rules are disabled to improve performance
        // Use `npm run type-check` for full TypeScript checking
        projectService: false,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "@typescript-eslint": ts.plugin,
      "heytrack": {
        rules: {
          "consistent-error-handling": consistentErrorHandling,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
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
      "no-nested-ternary": "error",
      "no-unneeded-ternary": "error",
      "object-shorthand": ["error", "always"],
      "prefer-destructuring": ["error", {
        array: false,
        object: true,
      }],
      "yoda": "error",
      "no-lonely-if": "error",
      "no-else-return": ["error", { allowElseIf: false }],

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
      // "@typescript-eslint/no-unnecessary-type-assertion": "error", // Requires type info
      // "@typescript-eslint/prefer-nullish-coalescing": "error", // Requires type info
      // "@typescript-eslint/prefer-optional-chain": "error", // Requires type info
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
          minimumDescriptionLength: 10,
        },
      ],
      // ⚡ PERFORMANCE: Type-aware rules disabled for faster linting
      // These rules require TypeScript type information which slows down ESLint significantly
      // Use `npm run type-check` for full TypeScript type checking instead
      // "@typescript-eslint/no-floating-promises": "error",
      // "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-unsafe-declaration-merging": "error",
      "@typescript-eslint/no-empty-object-type": "error",
      // "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],

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
      // "heytrack/consistent-error-handling": "error", // Disabled - needs update for ESLint 9

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
    },
  },
  
  // ============================================
  // API ROUTES SPECIFIC RULES
  // ============================================
  {
    files: ["src/app/api/**/*.ts"],
    rules: {
      // "@typescript-eslint/no-floating-promises": "error", // Disabled for performance
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
