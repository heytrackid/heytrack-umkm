import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // TypeScript Rules - Stricter to prevent common errors
      "@typescript-eslint/no-explicit-any": "warn", // Warn on any usage
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/explicit-function-return-type": "off", // Too strict for React
      "@typescript-eslint/ban-ts-comment": "warn",
      
      // Prevent undefined variables (catches 'key', 'value', 'data' errors)
      "no-undef": "error",
      "no-unused-vars": "off", // Use TS version instead
      
      // React Rules
      "react/no-unescaped-entities": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      
      // General Code Quality
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "warn",
      "no-duplicate-imports": "error",
      "prefer-const": "warn",
      "no-var": "error",
      
      // Async/Promise handling
      "no-async-promise-executor": "error",
      "require-await": "warn",
      
      // Null safety
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
    },
  },
];

export default eslintConfig;
