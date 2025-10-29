# 🧹 Cleanup Summary - Files to Delete

## 📊 Quick Stats

- **Unused files (0 imports):** 5 files ✅ Safe to delete
- **Low usage files (1-2 imports):** 7 files ⚠️ Review first
- **Total potential cleanup:** 12 files
- **Estimated LOC reduction:** ~1,500-2,000 lines

---

## ❌ SAFE TO DELETE (0 imports)

### 1. `src/lib/toast-helpers.ts`
- **Reason:** Not imported anywhere
- **Alternative:** Use `src/lib/shared/toast-utils.ts` or direct toast calls

### 2. `src/lib/supabase-helpers.ts`
- **Reason:** Not imported anywhere
- **Alternative:** Use `src/lib/supabase/` folder utilities

### 3. `src/lib/supabase-typed-client.ts`
- **Reason:** Not imported anywhere
- **Alternative:** Use `src/lib/supabase-client.ts`

### 4. `src/lib/data-synchronization.ts`
- **Reason:** Not imported anywhere
- **Alternative:** Functionality likely moved elsewhere or unused

### 5. `src/lib/query-optimization.ts`
- **Reason:** Not imported anywhere
- **Alternative:** Optimization logic likely in other files

---

## ⚠️ REVIEW BEFORE DELETE (1-2 imports)

### 1. `src/hooks/responsive/compatibility.ts` (1 import)
- **Status:** Marked as `@deprecated`
- **Alternative:** Use `useResponsive()` hook
- **Action:** Find the 1 import, replace with `useResponsive()`, then delete

### 2. `src/lib/automation-engine.ts` (1 import)
- **Alternative:** Use `src/lib/automation/index.ts`
- **Action:** Check if it's just a re-export, if yes delete

### 3. `src/lib/business-services.ts` (2 imports)
- **Alternative:** Use `src/lib/business-services/index.ts`
- **Action:** Check if it's just a re-export, if yes delete

### 4. `src/lib/cron.ts` (2 imports)
- **Alternative:** Use `src/lib/cron/index.ts`
- **Action:** Check if it's just a re-export, if yes delete

### 5. `src/lib/debounce.ts` (1 import)
- **Alternative:** Use `useDebounce` hook from `src/hooks/useDebounce.ts`
- **Action:** Replace import with hook, then delete

### 6. `src/lib/ingredients-toast.ts` (1 import)
- **Alternative:** Use generic toast utilities
- **Action:** Replace with generic toast, then delete

### 7. `src/lib/settings-validation.ts` (1 import)
- **Alternative:** Use `src/lib/validations/` folder
- **Action:** Move validation to proper location, then delete

---

## 🎯 Deletion Commands

### Step 1: Delete unused files (safe)
```bash
rm src/lib/toast-helpers.ts
rm src/lib/supabase-helpers.ts
rm src/lib/supabase-typed-client.ts
rm src/lib/data-synchronization.ts
rm src/lib/query-optimization.ts
```

### Step 2: Verify no errors
```bash
pnpm type-check
```

### Step 3: Review low-usage files
```bash
# Find where each file is imported
grep -r "toast-helpers" src --include="*.ts" --include="*.tsx"
grep -r "compatibility" src --include="*.ts" --include="*.tsx"
# ... etc
```

### Step 4: Delete after review
```bash
# After replacing imports
rm src/hooks/responsive/compatibility.ts
rm src/lib/automation-engine.ts
rm src/lib/business-services.ts
rm src/lib/cron.ts
rm src/lib/debounce.ts
rm src/lib/ingredients-toast.ts
rm src/lib/settings-validation.ts
```

### Step 5: Final verification
```bash
pnpm type-check
pnpm build
```

---

## 📈 Expected Benefits

1. **Reduced bundle size** - Less code to bundle
2. **Faster builds** - Fewer files to process
3. **Cleaner codebase** - Less confusion about which file to use
4. **Better maintainability** - Clear single source of truth
5. **Improved DX** - Easier to find the right utility

---

## ⚠️ Important Notes

1. **Always run `pnpm type-check` after deletion**
2. **Test critical features** after cleanup
3. **Commit changes incrementally** (delete 1-2 files at a time)
4. **Keep git history** in case you need to restore

---

## 🚀 Quick Start

```bash
# 1. Run the check script
./scripts/check-unused-files.sh

# 2. Delete safe files
rm src/lib/toast-helpers.ts src/lib/supabase-helpers.ts src/lib/supabase-typed-client.ts src/lib/data-synchronization.ts src/lib/query-optimization.ts

# 3. Verify
pnpm type-check

# 4. Commit
git add -A
git commit -m "chore: remove unused utility files"
```

---

**Generated:** $(date)
**Script:** `scripts/check-unused-files.sh`
**Full list:** `FILES_TO_DELETE.md`
