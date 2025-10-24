# Type Safety Setup Summary

## What Was Done

This document summarizes the TypeScript and ESLint configuration to prevent `any` type usage across the project.

---

## 1. ESLint Configuration Updates (`eslint.config.mjs`)

### Changes Made:
- ✅ Changed `@typescript-eslint/no-explicit-any` from `warn` to `error`
- ✅ Added unsafe type checking rules (all errors):
  - `@typescript-eslint/no-unsafe-assignment`
  - `@typescript-eslint/no-unsafe-member-access`
  - `@typescript-eslint/no-unsafe-return`
  - `@typescript-eslint/no-unsafe-call`
  - `@typescript-eslint/no-unsafe-argument`
- ✅ Enabled strict function return types
- ✅ Enabled strict boolean expressions
- ✅ Disabled `ts-ignore` comments (must use `ts-expect-error` with description)

### Affected Rules:
```
Total Rules: 30+ ESLint rules enforcing type safety
Errors: All `any` usage will cause errors
No Warnings: Only errors, no ignored warnings
```

---

## 2. TypeScript Configuration Updates (`tsconfig.json`)

### Changes Made:
- ✅ Explicit `noImplicitAny: true`
- ✅ Added `noUnusedLocals: true`
- ✅ Added `noUnusedParameters: true`
- ✅ Added `noImplicitReturns: true`
- ✅ Added `noFallthroughCasesInSwitch: true`
- ✅ Added `noUncheckedIndexedAccess: true`
- ✅ Added `noImplicitOverride: true`

### Compiler Options Now Enabled:
```
- strict: true (includes all strict options)
- noImplicitAny: true
- strictNullChecks: true
- strictFunctionTypes: true
- strictBindCallApply: true
- strictPropertyInitialization: true
- noImplicitThis: true
- alwaysStrict: true
- noUnusedLocals: true
- noUnusedParameters: true
- noImplicitReturns: true
- noFallthroughCasesInSwitch: true
- noUncheckedIndexedAccess: true
- noImplicitOverride: true
```

---

## 3. Pre-commit Hook (`.husky/pre-commit`)

### What It Does:
Automatically runs type checking before each commit.

### Behavior:
- ✅ Runs `npm run type-check`
- ✅ Blocks commit if type errors exist
- ✅ Shows helpful error message with reference to documentation

### Command to Test:
```bash
git commit -m "test commit"
# Should fail if type errors exist
```

---

## 4. Type Safety Documentation

### Files Created:

#### `TYPE_SAFETY_RULES.md`
Complete guide with:
- ESLint rule explanations
- Anti-patterns (❌ BAD)
- Correct patterns (✅ GOOD)
- Common type errors and solutions
- Supabase API handling
- Exception handling procedures

#### `TYPE_SAFETY_SETUP.md` (this file)
Setup summary and usage guide

### Helper Utilities Created:

#### `src/lib/type-guards.ts`
30+ type guard functions to safely check types:
```typescript
// Examples:
isString(value)           // Safely check if value is string
isArray(value)            // Check if value is array
isObject(value)           // Check if value is object
assertType(value, check)  // Assert with validation
getNestedProperty(obj, 'path.to.prop')  // Safe nested access
parseJSON(str)            // Safe JSON parsing
```

#### `src/lib/safe-cast.ts`
Safe casting utilities to replace `as any`:
```typescript
// Examples:
castToString(value, fallback)      // Safe conversion to string
castToNumber(value, fallback)      // Safe conversion to number
getNestedProperty(obj, path)       // Safe nested property access
safeMap(arr, mapper)               // Safe array mapping
castSupabaseResult(result)         // Safe Supabase result parsing
```

---

## 5. How to Use

### For API Responses:

#### ❌ OLD (Disallowed):
```typescript
const { data } = await supabase.from('table').select()
const value = (data as any)[0].field
```

#### ✅ NEW (Correct):
```typescript
import { isArray, getNestedProperty } from '@/lib/type-guards'
import type { Database } from '@/types'

type Row = Database['public']['Tables']['table']['Row']

const { data } = await supabase.from('table').select()
if (isArray(data) && data.length > 0) {
  const value = getNestedProperty<Row>(data[0], 'field')
}
```

### For JSON Parsing:

#### ❌ OLD (Disallowed):
```typescript
const data = JSON.parse(json) as any
```

#### ✅ NEW (Correct):
```typescript
import { safeParseJSON } from '@/lib/safe-cast'
import { z } from 'zod'

const schema = z.object({ id: z.string() })
const data = safeParseJSON(json)
if (data && schema.safeParse(data).success) {
  // data is now typed safely
}
```

### For Function Parameters:

#### ❌ OLD (Disallowed):
```typescript
function process(data: any) {
  return data.value
}
```

#### ✅ NEW (Correct):
```typescript
interface Data {
  value: string
  id: number
}

function process(data: Data): string {
  return data.value
}
```

---

## 6. Error Resolution Workflow

### Step 1: Identify Error
```
error TS2345: Argument of type 'any' is not assignable to parameter of type 'string'.
error TS2571: Object is of type 'unknown'.
```

### Step 2: Choose Solution

| Scenario | Solution |
|----------|----------|
| API Response | Use type guards from `type-guards.ts` |
| JSON Parsing | Use `safeParseJSON` from `safe-cast.ts` |
| Function Param | Define proper interface/type |
| Array Operations | Use `safeMap`, `safeFilter` from `safe-cast.ts` |
| Unknown Type | Use type guard + type narrowing |

### Step 3: Implement

See `TYPE_SAFETY_RULES.md` for detailed examples.

### Step 4: Verify
```bash
npm run type-check
```

Should show:
```
✓ 0 errors
✓ All files OK
```

---

## 7. Common Errors & Fixes

### Error 1: "Argument of type 'any' is not assignable to parameter of type 'never'"
**Cause**: Supabase query result type is not recognized  
**Fix**: Use type guards or cast result safely

### Error 2: "Object is of type 'unknown'"
**Cause**: Missing type narrowing for unknown types  
**Fix**: Use `isObject()` type guard before accessing properties

### Error 3: "no-explicit-any"
**Cause**: Using `as any` type assertion  
**Fix**: Use proper types or `safeCast` utilities

### Error 4: "Cannot find module 'glob'"
**Cause**: Missing @types or imports  
**Fix**: Install types or use proper TypeScript imports

---

## 8. Running Type Checks

### Automatically (Recommended):
```bash
git commit -m "message"
# Type check runs automatically via pre-commit hook
```

### Manually:
```bash
npm run type-check
# Check all TypeScript files
```

### Watch Mode (Development):
```bash
npm run type-check -- --watch
# Re-runs on file changes
```

---

## 9. Exceptions

Rare cases where `any` is acceptable:

### Using `ts-expect-error` with Description:
```typescript
// ✅ ALLOWED - with reason and ticket number
// @ts-expect-error: External API returns wrong type, fix in #123
const value = (response as any).incorrectValue

// ❌ NOT ALLOWED - no description
// @ts-ignore
const value = (response as any).incorrectValue
```

### Untyped Third-Party Libraries:
```typescript
// Create src/types/lib-name.d.ts
declare module 'untyped-lib' {
  export interface Config { ... }
  export function init(config: Config): void
}
```

---

## 10. Team Guidelines

### Code Review Checklist:
- [ ] No `as any` used without `ts-expect-error` + description
- [ ] All function parameters have explicit types
- [ ] All function return types are explicit (except React components)
- [ ] No `any` in type definitions or interfaces
- [ ] Proper type guards used for unknown types
- [ ] No `!` non-null assertions without justification

### Commit Requirements:
- [ ] Run `npm run type-check` before pushing
- [ ] Pre-commit hook blocks commits with type errors
- [ ] All CI checks must pass including type checking

### Documentation:
- [ ] Refer to `TYPE_SAFETY_RULES.md` for patterns
- [ ] Use utility functions from `type-guards.ts` and `safe-cast.ts`
- [ ] Add type definitions for external data

---

## 11. Migration Path

### For Existing Code:
1. Run `npm run type-check` to see current errors
2. Prioritize critical files (API routes, hooks, components)
3. Use `TYPE_SAFETY_RULES.md` to fix errors
4. Apply `type-guards.ts` utilities where needed
5. Test thoroughly
6. Commit with clean type-check

### Files Currently Fixed:
- `src/app/api/dashboard/stats/route.ts` ✅
- `src/app/api/expenses/route.ts` ✅
- `src/app/api/customers/[id]/route.ts` ✅

### Still Need Work:
Run `npm run type-check` to see remaining errors.

---

## 12. Resources

- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **ESLint TypeScript**: https://typescript-eslint.io/
- **Type Guards**: `TYPE_SAFETY_RULES.md` → "Handling `unknown` Type"
- **Helper Functions**: `src/lib/type-guards.ts`, `src/lib/safe-cast.ts`

---

## 13. FAQ

### Q: Can I still use `any`?
**A**: No, except with `ts-expect-error` + description. Use type guards instead.

### Q: What if a library doesn't have types?
**A**: Create declaration file in `src/types/lib-name.d.ts`.

### Q: How do I handle unknown data from APIs?
**A**: Use `type-guards.ts` utilities and validation libraries like Zod.

### Q: Does this slow down compilation?
**A**: Minimal impact. Strict checks improve code quality without significant performance loss.

### Q: Can I disable type checking for a file?
**A**: Not recommended. Add `// ts-check` comment at top of file if absolutely necessary, but use `ts-expect-error` with justification instead.

---

## 14. Support

### Getting Help:
1. Check `TYPE_SAFETY_RULES.md` for pattern examples
2. Review `src/lib/type-guards.ts` for utility functions
3. Look at fixed files for reference implementations
4. Search for `ts-expect-error` comments for exceptions

### Reporting Issues:
If you find type checking catching a false positive:
1. Document the scenario
2. Create an issue with the error message
3. Include `// @ts-expect-error` with justification
4. Raise for team review

---

## Summary

✅ **Type Safety is Now Enforced**

- ESLint: Blocks all `any` usage
- TSConfig: Strict type checking enabled
- Pre-commit: Prevents commits with type errors
- Tools: Helper utilities available in `src/lib/`
- Docs: Complete reference in `TYPE_SAFETY_RULES.md`

**Next Step**: Run `npm run type-check` and fix errors using the guidelines above.
