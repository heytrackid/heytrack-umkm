# Design Document

## Overview

This design outlines the approach for systematically fixing 282 ESLint errors in the HeyTrack codebase. The strategy prioritizes auto-fixable errors first, followed by manual fixes for common error patterns.

## Architecture

### Error Analysis Phase
- Run ESLint with detailed output to categorize errors
- Generate error report grouped by rule type
- Identify auto-fixable vs manual-fix errors
- Prioritize errors by impact and frequency

### Fix Implementation Phase
- Phase 1: Apply auto-fixes using `eslint --fix`
- Phase 2: Fix unused variables and imports
- Phase 3: Fix duplicate imports
- Phase 4: Fix type-related errors
- Phase 5: Fix remaining manual errors

### Verification Phase
- Run ESLint to confirm zero errors
- Run TypeScript compiler to ensure type safety
- Run build to ensure no breaking changes
- Run tests if available

## Components and Interfaces

### Error Categories (Based on Current Analysis)

1. **Unused Variables** (`@typescript-eslint/no-unused-vars`)
   - Unused function parameters
   - Unused imports
   - Unused local variables
   - Fix: Prefix with `_` or remove

2. **Duplicate Imports** (`no-duplicate-imports`)
   - Multiple import statements from same module
   - Fix: Consolidate into single import

3. **Type Issues** (`@typescript-eslint/no-explicit-any`, `@typescript-eslint/consistent-type-definitions`)
   - Explicit `any` types
   - Type vs interface inconsistency
   - Fix: Replace with specific types, convert to interfaces

4. **Unused Expressions** (`@typescript-eslint/no-unused-expressions`)
   - Statements that have no effect
   - Fix: Remove or convert to proper statements

5. **Code Style** (`arrow-body-style`, `prefer-destructuring`)
   - Arrow function body style
   - Destructuring preferences
   - Fix: Apply consistent style

6. **Other Rules**
   - Non-null assertions
   - Unnecessary type assertions
   - Various other violations

## Data Models

### Error Report Structure
```typescript
interface ErrorReport {
  totalErrors: number
  autoFixable: number
  manualFix: number
  errorsByRule: Map<string, ErrorDetail[]>
  errorsByFile: Map<string, number>
}

interface ErrorDetail {
  file: string
  line: number
  column: number
  rule: string
  message: string
  fixable: boolean
}
```

## Error Handling

- Backup files before making changes (Git handles this)
- Verify each fix doesn't break functionality
- Run incremental checks after each phase
- Rollback if critical errors are introduced

## Testing Strategy

1. **Pre-fix Baseline**
   - Document current error count (282 errors)
   - Run TypeScript compiler (should pass)
   - Run build (should pass)

2. **Incremental Verification**
   - After each fix phase, run ESLint
   - Verify error count decreases
   - Ensure no new errors introduced

3. **Final Verification**
   - ESLint should report 0 errors
   - TypeScript compiler should pass
   - Build should succeed
   - Application should function correctly

## Implementation Approach

### Priority 1: Auto-fixable Errors (Estimated: ~11 errors)
Run `pnpm lint --fix` to automatically resolve:
- Code style issues
- Simple formatting problems
- Consistent patterns

### Priority 2: Unused Variables (Estimated: ~100+ errors)
- Prefix unused parameters with `_`
- Remove unused imports
- Remove unused local variables

### Priority 3: Duplicate Imports (Estimated: ~5 errors)
Files affected:
- `src/types/database.ts`
- `src/utils/responsive.ts`
- Others as identified

### Priority 4: Type Issues (Estimated: ~50 errors)
- Replace `any` with specific types
- Convert types to interfaces where appropriate
- Remove unnecessary type assertions

### Priority 5: Remaining Manual Fixes (Estimated: ~100+ errors)
- Fix unused expressions
- Fix code style issues
- Address rule-specific violations

## Risk Mitigation

- Use Git to track all changes
- Test incrementally after each phase
- Focus on one error category at a time
- Verify build and TypeScript compilation after each phase
- Keep changes minimal and focused
