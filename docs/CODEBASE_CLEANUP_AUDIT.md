# 🧹 Codebase Cleanup Audit - Complete Analysis

## 📊 Executive Summary

Audit menyeluruh terhadap codebase HeyTrack untuk mengidentifikasi file yang tidak terpakai, duplikat, atau deprecated.

**Total Files Identified:** 25+ files  
**Estimated Cleanup Size:** ~150 KB  
**Risk Level:** 🟡 Medium (requires careful verification)

---

## ❌ Category 1: Duplicate Index Files (HIGH PRIORITY)

### 1.1 Forms Directory - Duplicate Exports

**Problem:** Ada 2 file index dengan fungsi berbeda

| File | Size | Purpose | Status |
|------|------|---------|--------|
| `src/components/forms/index.ts` | 0.3 KB | Simple exports | ⚠️ Keep (simpler) |
| `src/components/forms/index.tsx` | 4.5 KB | Lazy loading with React | ❌ Remove (complex, unused) |

**Reason to remove `.tsx`:**
- Lazy loading sudah ada di `src/components/lazy/`
- Duplikasi fungsi
- Tidak ada yang import dari file ini

**Action:**
```bash
rm src/components/forms/index.tsx
```

---

### 1.2 Lazy Directory - Duplicate Exports

**Problem:** Ada 2 file index dengan fungsi berbeda

| File | Size | Purpose | Status |
|------|------|---------|--------|
| `src/components/lazy/index.ts` | 8.2 KB | Comprehensive lazy loading | ✅ Keep (main) |
| `src/components/lazy/index.tsx` | 6.8 KB | Alternative lazy loading | ❌ Remove (duplicate) |

**Reason to remove `.tsx`:**
- `index.ts` lebih lengkap dan terstruktur
- `index.tsx` adalah implementasi alternatif yang tidak digunakan
- Menyebabkan konflik import

**Action:**
```bash
rm src/components/lazy/index.tsx
```

---

## ❌ Category 2: Old Ingredients Files (CONFIRMED UNUSED)

### 2.1 Components

| File | Size | Replacement | Status |
|------|------|-------------|--------|
| `src/components/forms/IngredientForm.tsx` | 4.5 KB | `EnhancedIngredientForm.tsx` | ❌ Remove |
| `src/components/crud/ingredients-crud.tsx` | 5.2 KB | `EnhancedIngredientsPage.tsx` | ❌ Remove |
| `src/components/forms/shared/IngredientFormFields.tsx` | 3.8 KB | Integrated in Enhanced | ❌ Remove |

### 2.2 Stores

| File | Size | Replacement | Status |
|------|------|-------------|--------|
| `src/lib/stores/ingredients-store.ts` | 3.2 KB | `useIngredients()` hook | ❌ Remove |

**Total:** 16.7 KB

**Action:** Already documented in `INGREDIENTS_OLD_FILES_CLEANUP.md`

---

## ❌ Category 3: Unused Store Files

### 3.1 Zustand Stores (Mock Data)

All stores in `src/lib/stores/` use mock data and are not integrated with Supabase:

| File | Size | Status | Reason |
|------|------|--------|--------|
| `src/lib/stores/customers-store.ts` | ~3 KB | ⚠️ Check | Mock data, not used |
| `src/lib/stores/expenses-store.ts` | ~3 KB | ⚠️ Check | Mock data, not used |
| `src/lib/stores/orders-store.ts` | ~3 KB | ⚠️ Check | Mock data, not used |
| `src/lib/stores/recipes-store.ts` | ~3 KB | ⚠️ Check | Mock data, not used |
| `src/lib/stores/reports-store.ts` | ~3 KB | ⚠️ Check | Mock data, not used |

**Current Approach:**
- Using React Query (`useQuery`, `useMutation`)
- Direct Supabase integration
- Real-time subscriptions

**Recommendation:** Verify usage, then remove if unused

---

## ❌ Category 4: Root Index File

### 4.1 Unused Root Export

| File | Size | Status | Reason |
|------|------|--------|--------|
| `src/index.ts` | 1.5 KB | ❌ Remove | Not used, Next.js doesn't need root index |

**Reason:**
- Next.js uses file-based routing
- No imports from `src/index.ts` found
- Exports modules that don't exist

**Action:**
```bash
rm src/index.ts
```

---

## ❌ Category 5: Empty/Placeholder Directories

### 5.1 Empty Agent Directories

```
src/agents/
├── assistants/     ❌ Empty
├── insights/       ❌ Empty
└── workflows/      ❌ Empty
```

**Action:**
```bash
# Remove empty directories
rmdir src/agents/assistants
rmdir src/agents/insights  
rmdir src/agents/workflows
```

### 5.2 Empty Test Directory

```
src/types/__tests__/    ❌ Empty
```

**Action:**
```bash
rmdir src/types/__tests__
```

---

## ⚠️ Category 6: Potential Duplicates (NEEDS VERIFICATION)

### 6.1 Supabase Client Files

Multiple Supabase client implementations:

| File | Purpose | Status |
|------|---------|--------|
| `src/lib/supabase-client.ts` | Main client | ✅ Keep |
| `src/lib/supabase-client-typed.ts` | Typed client | ⚠️ Check |
| `src/lib/supabase-typed-client.ts` | Typed client | ⚠️ Check (duplicate?) |
| `src/utils/supabase/client.ts` | Utils client | ✅ Keep |
| `src/utils/supabase/client-safe.ts` | Safe client | ⚠️ Check |

**Action:** Verify which ones are actually used

### 6.2 Error Handler Files

| File | Purpose | Status |
|------|---------|--------|
| `src/lib/error-handler.ts` | Main handler | ✅ Keep |
| `src/lib/errors.ts` | Error types | ✅ Keep |
| `src/lib/auth-errors.ts` | Auth errors | ✅ Keep |
| `src/hooks/error-handler/` | Hook-based | ⚠️ Check overlap |

### 6.3 Performance Files

| File | Purpose | Status |
|------|---------|--------|
| `src/lib/performance.ts` | Main perf utils | ✅ Keep |
| `src/lib/performance-optimized.ts` | Optimized version | ⚠️ Check duplicate |
| `src/hooks/usePerformance.ts` | Hook | ✅ Keep |
| `src/hooks/usePerformanceMonitoring.ts` | Monitoring | ⚠️ Check overlap |

### 6.4 Responsive Hooks

| File | Purpose | Status |
|------|---------|--------|
| `src/hooks/useResponsive.ts` | Main hook | ✅ Keep |
| `src/hooks/use-mobile.tsx` | Mobile hook | ⚠️ Check duplicate |
| `src/hooks/responsive/useResponsive.ts` | Detailed hook | ⚠️ Check duplicate |
| `src/utils/responsive.ts` | Utils | ⚠️ Check |

---

## ⚠️ Category 7: Validation Files (NEEDS REVIEW)

### 7.1 Ingredient Validation

| File | Status | Action |
|------|--------|--------|
| `src/lib/validations/domains/ingredient.ts` | ⚠️ Check | Verify API usage |
| `src/lib/validations/domains/ingredient-helpers.ts` | ⚠️ Check | Verify usage |

**Note:** Might still be used by API routes

---

## ⚠️ Category 8: Deprecated Config Files

### 8.1 Next.js Config

| File | Purpose | Status |
|------|---------|--------|
| `next.config.ts` | Main config | ✅ Keep |
| `next.config.performance.ts` | Performance config | ⚠️ Check if imported |

### 8.2 TypeScript Configs

| File | Purpose | Status |
|------|---------|--------|
| `tsconfig.json` | Main config | ✅ Keep |
| `tsconfig.eslint.json` | ESLint config | ✅ Keep |
| `tsconfig.api-safe.json` | API config | ⚠️ Check usage |

---

## 📊 Cleanup Priority Matrix

| Priority | Category | Files | Size | Risk |
|----------|----------|-------|------|------|
| 🔴 P0 | Duplicate index files | 2 | 11 KB | Low |
| 🔴 P0 | Root index.ts | 1 | 1.5 KB | Low |
| 🔴 P0 | Empty directories | 4 | 0 KB | Low |
| 🟡 P1 | Old ingredients | 4 | 17 KB | Low |
| 🟡 P1 | Unused stores | 5 | 15 KB | Medium |
| 🟢 P2 | Duplicate clients | 3 | 10 KB | High |
| 🟢 P2 | Duplicate hooks | 4 | 8 KB | High |
| 🔵 P3 | Validation files | 2 | 5 KB | High |

---

## 🚀 Cleanup Script

### Phase 1: Safe Deletions (Low Risk)

```bash
#!/bin/bash

echo "Phase 1: Safe Deletions"
echo "======================="

# Duplicate index files
rm src/components/forms/index.tsx
rm src/components/lazy/index.tsx

# Root index
rm src/index.ts

# Empty directories
rmdir src/agents/assistants
rmdir src/agents/insights
rmdir src/agents/workflows
rmdir src/types/__tests__

# Old ingredients files
rm src/components/forms/IngredientForm.tsx
rm src/components/crud/ingredients-crud.tsx
rm src/components/forms/shared/IngredientFormFields.tsx
rm src/lib/stores/ingredients-store.ts

echo "✓ Phase 1 complete"
npm run type-check
```

### Phase 2: Verify Then Delete (Medium Risk)

```bash
#!/bin/bash

echo "Phase 2: Verify Usage"
echo "===================="

# Check store usage
echo "Checking stores..."
grep -r "customers-store" src/ --include="*.tsx" --include="*.ts" || echo "✓ customers-store not used"
grep -r "expenses-store" src/ --include="*.tsx" --include="*.ts" || echo "✓ expenses-store not used"
grep -r "orders-store" src/ --include="*.tsx" --include="*.ts" || echo "✓ orders-store not used"
grep -r "recipes-store" src/ --include="*.tsx" --include="*.ts" || echo "✓ recipes-store not used"
grep -r "reports-store" src/ --include="*.tsx" --include="*.ts" || echo "✓ reports-store not used"

# If all not used, delete
read -p "Delete unused stores? (y/N) " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm src/lib/stores/customers-store.ts
    rm src/lib/stores/expenses-store.ts
    rm src/lib/stores/orders-store.ts
    rm src/lib/stores/recipes-store.ts
    rm src/lib/stores/reports-store.ts
    echo "✓ Stores deleted"
fi
```

### Phase 3: Manual Review (High Risk)

Files that need manual verification:
- Supabase client duplicates
- Responsive hook duplicates
- Performance file duplicates
- Validation files

---

## ✅ Post-Cleanup Checklist

- [ ] Run `npm run type-check`
- [ ] Run `npm run lint`
- [ ] Run `npm run build`
- [ ] Test all pages manually
- [ ] Check bundle size reduction
- [ ] Commit with clear message

---

## 📈 Expected Benefits

### Code Quality
- ✅ Remove ~60-80 KB unused code
- ✅ Eliminate confusion from duplicates
- ✅ Cleaner import paths
- ✅ Easier maintenance

### Performance
- ✅ Smaller bundle size
- ✅ Faster build times
- ✅ Less code to analyze

### Developer Experience
- ✅ Clear file structure
- ✅ No duplicate functionality
- ✅ Better code organization

---

## 🔄 Rollback Plan

```bash
# Restore all deleted files
git checkout HEAD~1 -- src/

# Or revert specific commit
git revert <commit-hash>
```

---

## 📝 Recommended Actions

### Immediate (This Week)
1. ✅ Delete duplicate index files
2. ✅ Delete root index.ts
3. ✅ Remove empty directories
4. ✅ Delete old ingredients files

### Short Term (Next Week)
5. ⚠️ Verify and delete unused stores
6. ⚠️ Consolidate Supabase clients
7. ⚠️ Consolidate responsive hooks

### Long Term (Next Month)
8. 📋 Audit all validation files
9. 📋 Consolidate performance utilities
10. 📋 Document file structure

---

**Created:** 2025-10-27  
**Status:** Ready for review  
**Next Step:** Run Phase 1 cleanup script
