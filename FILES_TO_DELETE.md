# Files yang Bisa Dihapus (.ts & .tsx)

## ✅ VERIFIED RESULTS (from check-unused-files.sh)

### ❌ UNUSED (0 imports) - SAFE TO DELETE
```
src/lib/toast-helpers.ts
src/lib/supabase-helpers.ts
src/lib/supabase-typed-client.ts
src/lib/data-synchronization.ts
src/lib/query-optimization.ts
```
**Total: 5 files**

### ⚠️ LOW USAGE (1-2 imports) - REVIEW BEFORE DELETE
```
src/hooks/responsive/compatibility.ts        (1 import)  - @deprecated
src/lib/automation-engine.ts                 (1 import)
src/lib/business-services.ts                 (2 imports)
src/lib/cron.ts                              (2 imports)
src/lib/debounce.ts                          (1 import)
src/lib/ingredients-toast.ts                 (1 import)
src/lib/settings-validation.ts               (1 import)
```
**Total: 7 files**

### ✅ ACTIVELY USED - DO NOT DELETE
```
src/lib/api-core.ts                          (10 imports)
src/lib/communications.ts                    (5 imports)
src/lib/errors.ts                            (17 imports)
src/lib/validations.ts                       (53 imports)
src/lib/error-handler.ts                     (6 imports)
src/lib/api-helpers.ts                       (3 imports)
src/lib/type-guards.ts                       (15 imports)
```

---

## 🔴 PRIORITY 1 - Definitely Can Delete

### Test Files (if not used)
```
src/__tests__/hpp/HppExportService.test.ts
src/lib/automation/workflows/__tests__/order-workflows.test.ts
```

### Deprecated Files
```
src/hooks/responsive/compatibility.ts
```
**Reason:** Marked as @deprecated, use `useResponsive()` instead

## 🟡 PRIORITY 2 - Likely Duplicates (Verify First)

### Root Files vs Folder Index Files
Check if these are just re-exports, if yes, delete root file:

```
src/lib/api-core.ts              → Use: src/lib/api-core/index.ts
src/lib/automation-engine.ts     → Use: src/lib/automation/index.ts  
src/lib/business-services.ts     → Use: src/lib/business-services/index.ts
src/lib/communications.ts        → Use: src/lib/communications/index.ts
src/lib/cron.ts                  → Use: src/lib/cron/index.ts
src/lib/errors.ts                → Use: src/lib/errors/api-error-handler.ts
src/lib/validations.ts           → Use: src/lib/validations/index.ts
```

### Potentially Consolidated Utilities
```
src/lib/debounce.ts              → Check if useDebounce hook used instead
src/lib/ingredients-toast.ts     → Specific toast, might be unused
src/lib/toast-helpers.ts         → Check if in shared/toast-utils.ts
src/lib/supabase-helpers.ts      → Check if in supabase/ folder
src/lib/supabase-typed-client.ts → Check if using supabase-client.ts
src/lib/error-handler.ts         → Check if using errors/api-error-handler.ts
src/lib/api-helpers.ts           → Check if in api-core/ or shared/
```

### Potentially Moved Files
```
src/lib/data-synchronization.ts  → Check if functionality moved
src/lib/query-optimization.ts    → Check if consolidated
src/lib/settings-validation.ts   → Check if in validations/
src/lib/type-guards.ts           → Check if in types/
```

## 🟢 PRIORITY 3 - Check for Duplicates

### Shared Utils (might overlap)
```
src/lib/shared/api-utils.ts      vs  src/lib/shared/api.ts
src/lib/shared/utilities.ts      vs  src/lib/utils.ts
src/lib/shared/performance.ts    vs  src/lib/performance.ts
                                  vs  src/lib/performance-optimized.ts
```

## 📋 Verification Commands

### Check if file is imported:
```bash
# Replace 'api-core' with filename
filename="api-core"
grep -r "from.*['\"].*${filename}" src --include="*.ts" --include="*.tsx" | wc -l

# Check specific imports
grep -r "import.*from.*'@/lib/${filename}'" src
grep -r "import.*from.*'\.\.\/.*${filename}'" src
```

### Check if file exports anything used:
```bash
# Get exports from file
grep "^export" src/lib/api-core.ts

# Search for usage of those exports
grep -r "import.*{.*ApiCore.*}" src
```

## ⚠️ DO NOT DELETE (Different Purposes)

These look similar but serve different purposes:
- `src/lib/api-cache.ts` - HTTP caching for API responses
- `src/lib/cache.ts` - Application cache keys
- `src/lib/performance.ts` - Performance utilities
- `src/lib/performance-optimized.ts` - Optimized array operations

## 🎯 Recommended Action Plan

1. **Start with Priority 1** - Safe to delete
2. **For Priority 2** - Run verification commands first
3. **For Priority 3** - Compare file contents, merge if duplicate
4. **After deleting** - Run `pnpm type-check` to ensure no breakage

## 📊 Estimated Cleanup

- **Priority 1:** ~3 files (safe delete)
- **Priority 2:** ~14 files (verify first)  
- **Priority 3:** ~6 files (merge duplicates)

**Total potential cleanup:** ~23 files
