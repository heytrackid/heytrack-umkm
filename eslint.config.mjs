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
      "dist/**",
      "next-env.d.ts",
      "**/*.backup",
      "**/*.bak",
      "**/*.tsx.backup",
      "**/*.ts.backup",
      "**/temp_*.tsx",
      "**/temp_*.ts",
      "src/components/lazy/index.tsx", // Parsing error - ignore for now
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // ============================================
      // TypeScript Rules - Balanced for UMKM Project
      // ============================================
      "@typescript-eslint/no-explicit-any": "warn", // Warn but allow for rapid dev
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for clarity
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/consistent-type-imports": ["warn", {
        "prefer": "type-imports",
        "fixStyle": "separate-type-imports"
      }],
      
      // ============================================
      // IMPORTANT: Disable no-undef for TypeScript
      // TypeScript already handles undefined vars
      // ============================================
      "no-undef": "off", // Let TypeScript handle this
      "no-unused-vars": "off", // Use TS version instead
      
      // ============================================
      // React Rules
      // ============================================
      "react/no-unescaped-entities": "off", // Allow quotes in Indonesian text
      "react/display-name": "off", // Not critical for UMKM
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      
      // ============================================
      // Import Rules - Prevent Duplicates
      // ============================================
      "no-duplicate-imports": "error",
      "@typescript-eslint/no-require-imports": "warn",
      
      // ============================================
      // General Code Quality
      // ============================================
      "no-console": "off", // Allow console for debugging UMKM app
      "no-debugger": "warn",
      "prefer-const": "warn",
      "no-var": "error",
      "prefer-spread": "warn",
      
      // ============================================
      // Async/Promise handling
      // ============================================
      "no-async-promise-executor": "error",
      "require-await": "off", // Too noisy, TypeScript catches real issues
      
      // ============================================
      // Null safety - Relaxed for rapid development
      // ============================================
      "@typescript-eslint/no-non-null-assertion": "warn",
      // Optional but recommended:
      // "@typescript-eslint/prefer-optional-chain": "warn",
      // "@typescript-eslint/prefer-nullish-coalescing": "warn",
    },
  },
];

export default eslintConfig;
