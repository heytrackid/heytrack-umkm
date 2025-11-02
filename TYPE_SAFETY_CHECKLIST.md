# 🎯 Type Safety Checklist

## ✅ Progress: Unknown Type Elimination

### Completed:
- ✅ Created unified type system (`src/types/type-utilities.ts`)
- ✅ Replaced `unknown` with `JsonValue`, `DataObject`, `CatchError`
- ✅ Removed duplicate type guard files
- ✅ Updated all type guards to use `JsonValue`
- ✅ Enabled strict TypeScript checks in `tsconfig.json`

### Current Status:
- **Total Errors**: 933 (with full strict mode)
- **Main Issues**:
  1. Unused imports (23)
  2. Possibly undefined values (22)
  3. Missing type imports (30)
  4. Index signature access (17)

---

## 🔧 How to Fix Remaining Issues

### 1. Missing Imports (30 errors)
**Problem**: Files using `JsonValue`, `DataObject`, `CatchError` without importing

**Fix**:
```typescript
// Add to top of file
import type { JsonValue, DataObject, CatchError } from '@/types/type-utilities'
```

**Files to fix**:
```bash
# Find files that need imports
grep -l "JsonValue\|DataObject\|CatchError" src/**/*.{ts,tsx} | \
  xargs -I {} sh -c 'grep -L "from.*type-utilities" {}'
```

### 2. Unused Imports (23 errors)
**Problem**: Imported types that are never used

**Fix**: Remove unused imports
```typescript
// Before
import type { Json, Update, CatchError } from '@/types/database'

// After (if only using Json)
import type { Json } from '@/types/database'
```

### 3. Possibly Undefined (33 errors)
**Problem**: `noUncheckedIndexedAccess` requires null checks

**Fix**: Add optional chaining or null checks
```typescript
// Before
const name = user.name

// After
const name = user?.name || 'Unknown'
// or
if (user) {
  const name = user.name
}
```

### 4. Index Signature Access (17 errors)
**Problem**: `noPropertyAccessFromIndexSignature` requires bracket notation

**Fix**: Use bracket notation for index signatures
```typescript
// Before
const desc = data.description

// After
const desc = data['description']
```

### 5. String | Undefined (29 errors)
**Problem**: Passing potentially undefined values to functions expecting string

**Fix**: Add null coalescing or type guards
```typescript
// Before
doSomething(userId)

// After
doSomething(userId || '')
// or
if (userId) {
  doSomething(userId)
}
```

---

## 📋 Quick Fix Commands

### Remove unused imports automatically:
```bash
npx eslint --fix "src/**/*.{ts,tsx}"
```

### Find files with missing type imports:
```bash
npx tsc --noEmit 2>&1 | grep "Cannot find name" | cut -d: -f1 | sort -u
```

### Count errors by type:
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | cut -d: -f3 | sort | uniq -c | sort -rn
```

---

## 🎯 Priority Order

1. **High Priority** (Quick wins):
   - [ ] Add missing imports (30 files)
   - [ ] Remove unused imports (23 files)

2. **Medium Priority**:
   - [ ] Fix possibly undefined (33 cases)
   - [ ] Fix string | undefined (29 cases)

3. **Low Priority** (Can be done gradually):
   - [ ] Fix index signature access (17 cases)
   - [ ] Fix OrderWithItems type issues (9 cases)

---

## 📊 Expected Outcome

After fixing all issues:
- ✅ Zero TypeScript errors
- ✅ Full type safety across codebase
- ✅ No `unknown` or `any` types (except where truly necessary)
- ✅ Better IDE autocomplete
- ✅ Catch bugs at compile time, not runtime

---

## 🚀 Next Steps

1. Run: `npx tsc --noEmit` to see current errors
2. Pick a category from the checklist above
3. Fix all errors in that category
4. Commit changes
5. Repeat until zero errors

**Tip**: Fix one category at a time for easier code review!
