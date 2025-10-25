# ✅ Quick Checklist: Menghilangkan Duplikasi

**Print this and check off as you go!**

---

## 🎯 Before You Start

- [ ] Backup current code: `git checkout -b backup/before-refactor`
- [ ] Create working branch: `git checkout -b refactor/remove-duplicates`
- [ ] Read DUPLIKASI_AUDIT_REPORT.md
- [ ] Read DUPLIKASI_ACTION_PLAN.md
- [ ] Have SINGLE_SOURCE_OF_TRUTH_GUIDE.md open for reference

---

## Week 1: Critical Fixes

### ✅ Supabase Clients
- [ ] Find all imports: `grep -r "from '@/lib/supabase'" src/`
- [ ] Create db-helpers.ts
- [ ] Create realtime-helpers.ts
- [ ] Update all imports to use utils/supabase
- [ ] Delete useSupabaseClient.ts
- [ ] Test: `npm run build && npm run type-check`
- [ ] Commit changes

### ✅ Database Hooks
- [ ] Find all imports: `grep -r "useSupabaseData" src/`
- [ ] Update to useSupabase
- [ ] Delete useSupabaseData.ts
- [ ] Test CRUD operations
- [ ] Commit changes

### ✅ Responsive Hooks
- [ ] Find all imports: `grep -r "use-mobile" src/`
- [ ] Update to useResponsive
- [ ] Delete use-mobile.ts
- [ ] Test responsive behavior
- [ ] Commit changes

---

## Week 2: Type Definitions

### ✅ Interface Consolidation
- [ ] Find Recipe interfaces: `grep -r "interface Recipe" src/`
- [ ] Find Order interfaces: `grep -r "interface Order" src/`
- [ ] Find Ingredient interfaces: `grep -r "interface Ingredient" src/`
- [ ] Refactor data-synchronization/types.ts
- [ ] Refactor excel-export-lazy.service.ts
- [ ] Refactor ProductionDataIntegration.ts
- [ ] Refactor hpp-automation.ts
- [ ] Refactor EnhancedHPPCalculationService.ts
- [ ] Test: `npm run type-check`
- [ ] Commit changes

### ✅ Zod Schemas
- [ ] Find duplicate schemas: `grep -r "PaginationSchema" src/`
- [ ] Refactor api-validation.ts
- [ ] Update all imports
- [ ] Test API routes
- [ ] Commit changes

---

## Week 3: Cleanup & Docs

### ✅ Final Cleanup
- [ ] Remove backup files
- [ ] Update barrel exports
- [ ] Run: `npx eslint src/ --fix`
- [ ] Run: `npx prettier --write src/`
- [ ] Commit changes

### ✅ Documentation
- [ ] Update src/hooks/README.md
- [ ] Update src/types/README.md
- [ ] Create MIGRATION_GUIDE.md
- [ ] Update main README.md
- [ ] Update CHANGELOG.md
- [ ] Commit changes

### ✅ Testing
- [ ] `npm run type-check` ✅
- [ ] `npm run build` ✅
- [ ] `npm run lint` ✅
- [ ] Test login/logout
- [ ] Test CRUD operations
- [ ] Test responsive behavior
- [ ] Test real-time updates
- [ ] Test API routes
- [ ] Test form validation
- [ ] No console errors
- [ ] Deploy to staging
- [ ] Monitor for 24 hours
- [ ] Deploy to production

---

## 🎉 Final Verification

- [ ] All duplicate files deleted
- [ ] All imports updated
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Documentation complete
- [ ] Team notified
- [ ] Production stable

---

## 📊 Metrics Check

### Before
- Duplicate files: 5
- Duplicate interfaces: 20+
- Duplicate schemas: 10+

### After
- Duplicate files: 0 ✅
- Duplicate interfaces: 0 ✅
- Duplicate schemas: 0 ✅

---

## 🚀 Done!

- [ ] Merge to main
- [ ] Delete working branch
- [ ] Archive this checklist
- [ ] Celebrate! 🎉

---

**Started:** ___________  
**Completed:** ___________  
**Total Time:** ___________

