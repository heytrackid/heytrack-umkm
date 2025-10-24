# Type Safety - Quick Start Guide

## What's New?

Your project now enforces strict TypeScript type checking. **No `any` types allowed!** ✅

---

## 1. Initial Setup (First Time Only)

### Install Dependencies:
```bash
pnpm install
# This will automatically run: husky install
```

### Verify Setup:
```bash
npm run type-check
```

Expected output:
```
✓ No errors found
✓ Type checking passed
```

---

## 2. Making Changes

### When Editing Files:

1. **Check Types Locally**
   ```bash
   npm run type-check
   ```

2. **Fix Any Errors** using the guide below

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "fix: your message"
   # Pre-commit hook will run type-check automatically
   ```

---

## 3. Common Type Errors & Quick Fixes

### Error 1: "Object is of type 'unknown'"
```typescript
// ❌ WRONG
const value = (response as any).data

// ✅ CORRECT
import { isObject } from '@/lib/type-guards'
if (isObject(response) && 'data' in response) {
  const value = response.data
}
```

### Error 2: "Cannot find property 'X' on type"
```typescript
// ❌ WRONG
interface Data {
  id: string
}
function process(data: Data) {
  return data.value  // Property doesn't exist!
}

// ✅ CORRECT
interface Data {
  id: string
  value: string
}
function process(data: Data) {
  return data.value
}
```

### Error 3: "Parameter implicitly has type 'any'"
```typescript
// ❌ WRONG
const items = data.map(item => item.id)

// ✅ CORRECT
interface Item { id: string }
const items = data.map((item: Item) => item.id)
```

### Error 4: "Argument of type 'string' is not assignable to parameter of type 'number'"
```typescript
// ❌ WRONG
function process(count: number) { }
const value = "5"
process(value)  // Type mismatch!

// ✅ CORRECT
import { castToNumber } from '@/lib/safe-cast'
const value = "5"
process(castToNumber(value, 0))
```

---

## 4. Helper Tools Available

### Type Guards (`src/lib/type-guards.ts`)
```typescript
import { isString, isArray, isObject, assertType } from '@/lib/type-guards'

isString(value)              // Check if string
isArray(value)               // Check if array
isObject(value)              // Check if object
assertType(value, isString)  // Assert or throw
```

### Safe Casting (`src/lib/safe-cast.ts`)
```typescript
import { castToString, castToNumber, getNestedProperty } from '@/lib/safe-cast'

castToString(value, fallback)           // Safe string conversion
castToNumber(value, fallback)           // Safe number conversion
getNestedProperty(obj, 'path.to.prop')  // Safe nested access
safeParseJSON(json)                     // Safe JSON parsing
```

---

## 5. API Routes Example

### Bad ❌
```typescript
export async function GET(request: Request) {
  const { data } = await supabase.from('users').select()
  return NextResponse.json((data as any)[0])  // NO!
}
```

### Good ✅
```typescript
import type { Database } from '@/types'

type User = Database['public']['Tables']['users']['Row']

export async function GET(request: Request) {
  const { data } = await supabase.from('users').select()
  
  if (!Array.isArray(data) || data.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  const user: User = data[0]
  return NextResponse.json(user)
}
```

---

## 6. When Type Checking Fails

### 1. Read the Error Message Carefully
```
src/file.ts(10,5): error TS2345: Argument of type 'any' is not assignable 
to parameter of type 'string'.
```

### 2. Locate the Problem
- Line 10, Column 5 in `src/file.ts`
- An `any` type is being used where `string` is expected

### 3. Apply Solution
- Use type guards: `isString()`, `isObject()`
- Use safe casting: `castToString()`, `castToNumber()`
- Add proper type definitions: `interface`, `type`

### 4. Verify Fix
```bash
npm run type-check
```

---

## 7. Documentation

### Complete Reference:
- **TYPE_SAFETY_RULES.md** - Detailed rules and patterns
- **TYPE_SAFETY_SETUP.md** - Technical setup details
- **src/lib/type-guards.ts** - 30+ utility functions with docs
- **src/lib/safe-cast.ts** - Safe casting utilities with docs

### Quick Reference:
```bash
# View eslint config
cat eslint.config.mjs

# View tsconfig rules
cat tsconfig.json

# Check type guards available
grep "export function" src/lib/type-guards.ts
```

---

## 8. Common Workflows

### Fixing an Existing File

1. **Run type-check to find errors**
   ```bash
   npm run type-check | grep "your-file"
   ```

2. **Read the error**
   - Note the line number and error code

3. **Open the file and find the issue**
   - Most likely: `as any`, missing types, or unknown types

4. **Apply fix pattern** (see section 3 above)

5. **Verify**
   ```bash
   npm run type-check
   ```

### Creating a New File

1. **Add proper types from the start**
   ```typescript
   interface Props { id: string; }
   interface Result { success: boolean; data: any[] }  // ❌ Fix 'any'!
   ```

2. **Use type guards for external data**
   ```typescript
   import { isObject, assertType } from '@/lib/type-guards'
   
   const data = await fetch().then(r => r.json())
   assertType(data, isObject)  // Validates or throws
   ```

3. **Run type-check**
   ```bash
   npm run type-check
   ```

---

## 9. Pre-commit Checks

### Automatic Type Checking
When you commit:
```bash
git commit -m "fix: my change"
```

The pre-commit hook automatically:
1. ✅ Runs `npm run type-check`
2. ✅ Blocks commit if errors exist
3. ✅ Shows error message

### Bypass (Not Recommended)
```bash
git commit --no-verify
# Only use in emergencies!
```

---

## 10. FAQ

**Q: How do I know what types are available?**  
A: Check `src/types/index.ts` or hover over variables in your IDE.

**Q: Can I still use `any` sometimes?**  
A: Only with `@ts-expect-error` + description:
```typescript
// @ts-expect-error: External API has wrong types
const value = (response as any).field
```

**Q: What if a library doesn't have types?**  
A: Create a declaration file:
```typescript
// src/types/my-lib.d.ts
declare module 'my-lib' {
  export function init(): void
}
```

**Q: Is this required for all files?**  
A: Yes! Pre-commit hook enforces it.

**Q: How long does type-checking take?**  
A: Usually 10-30 seconds depending on changes.

---

## 11. Getting Help

### Resources:
- ESLint TypeScript: https://typescript-eslint.io/
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- This repository: See `TYPE_SAFETY_RULES.md`

### Check Examples:
1. Search for similar code in the codebase
2. Look at already-fixed files
3. Check `src/lib/type-guards.ts` for utility usage
4. Ask team members

---

## 12. Summary

✅ **Everything is setup!**

```
Type Safety Enforced:
├── ESLint: Blocks all 'any' usage
├── TypeScript: Strict compilation
├── Pre-commit: Automatic checking
└── Tools: Helper utilities available

Getting Started:
1. npm run type-check
2. Fix any errors using guide above
3. git commit (pre-commit hook runs type check)
4. Done!
```

**Need help?** → See `TYPE_SAFETY_RULES.md`

**Having errors?** → See section 3 "Common Type Errors & Quick Fixes"

Happy coding! 🎉
