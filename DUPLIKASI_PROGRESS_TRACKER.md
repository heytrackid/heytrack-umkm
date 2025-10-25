# 📊 Progress Tracker: Menghilangkan Duplikasi

**Started:** [Date]  
**Target Completion:** [Date + 3 weeks]  
**Current Status:** 🔴 Not Started

---

## 📅 Week 1: Critical Fixes

### Day 1-2: Consolidate Supabase Clients
- [ ] Audit current usage
- [ ] Create migration map
- [ ] Refactor src/lib/supabase.ts
  - [ ] Create src/lib/db-helpers.ts
  - [ ] Create src/lib/realtime-helpers.ts
- [ ] Update all imports
- [ ] Delete src/hooks/useSupabaseClient.ts
- [ ] Run tests
- [ ] Commit: `refactor: consolidate supabase clients`

**Status:** 🔴 Not Started  
**Blockers:** None  
**Notes:**

---

### Day 3-4: Consolidate Database Hooks
- [ ] Identify all usages of useSupabaseData
- [ ] Create migration guide
- [ ] Update components one by one
  - [ ] Update ingredients pages
  - [ ] Update recipes pages
  - [ ] Update orders pages
  - [ ] Update customers pages
- [ ] Delete src/hooks/useSupabaseData.ts
- [ ] Run tests
- [ ] Commit: `refactor: consolidate database hooks`

**Status:** 🔴 Not Started  
**Blockers:** Depends on Day 1-2  
**Notes:**

---

### Day 5: Consolidate Responsive Hooks
- [ ] Find all usages of use-mobile
- [ ] Update imports to useResponsive
- [ ] Delete src/hooks/use-mobile.ts
- [ ] Test responsive behavior
- [ ] Commit: `refactor: consolidate responsive hooks`

**Status:** 🔴 Not Started  
**Blockers:** None  
**Notes:**

---

## 📅 Week 2: Type Definitions

### Day 1-3: Consolidate Interface Definitions
- [ ] Enhance src/types/index.ts
- [ ] Find all local interface definitions
- [ ] Refactor priority files:
  - [ ] src/lib/data-synchronization/types.ts
  - [ ] src/services/excel-export-lazy.service.ts
  - [ ] src/services/production/ProductionDataIntegration.ts
  - [ ] src/lib/automation/hpp-automation.ts
  - [ ] src/modules/recipes/services/EnhancedHPPCalculationService.ts
- [ ] Handle special cases (extended types)
- [ ] Run type-check after each file
- [ ] Commit: `refactor: consolidate type definitions`

**Status:** 🔴 Not Started  
**Blockers:** None  
**Notes:**

---

### Day 4-5: Consolidate Zod Schemas
- [ ] Audit schema files
- [ ] Identify duplicates
- [ ] Refactor src/lib/api-validation.ts
  - [ ] Import schemas from validations/
  - [ ] Keep only middleware functions
- [ ] Update all imports
- [ ] Test API routes
- [ ] Commit: `refactor: consolidate zod schemas`

**Status:** 🔴 Not Started  
**Blockers:** None  
**Notes:**

---

## 📅 Week 3: Cleanup & Documentation

### Day 1-2: Final Cleanup
- [ ] Remove backup files
- [ ] Update barrel exports
  - [ ] src/hooks/index.ts
  - [ ] src/types/index.ts
  - [ ] src/lib/index.ts
- [ ] Clean up unused imports
- [ ] Run linter and prettier
- [ ] Commit: `chore: final cleanup after refactoring`

**Status:** 🔴 Not Started  
**Blockers:** Depends on Week 1-2  
**Notes:**

---

### Day 3-4: Documentation
- [ ] Update README files
  - [ ] src/hooks/README.md
  - [ ] src/types/README.md
  - [ ] src/lib/README.md
- [ ] Create MIGRATION_GUIDE.md
- [ ] Update main README.md
- [ ] Update CHANGELOG.md
- [ ] Commit: `docs: update after refactoring`

**Status:** 🔴 Not Started  
**Blockers:** Depends on Week 1-2  
**Notes:**

---

### Day 5: Testing & Verification
- [ ] Type checking: `npm run type-check`
- [ ] Build: `npm run build`
- [ ] Linting: `npm run lint`
- [ ] Unit tests: `npm run test`
- [ ] Manual testing checklist:
  - [ ] Login/Logout
  - [ ] CRUD operations
  - [ ] Responsive behavior
  - [ ] Real-time updates
  - [ ] API routes
  - [ ] Form validation
- [ ] Performance check
- [ ] Deploy to staging
- [ ] Monitor for issues
- [ ] Commit: `test: verify refactoring complete`

**Status:** 🔴 Not Started  
**Blockers:** Depends on all previous tasks  
**Notes:**

---

## 📊 Overall Progress

### Completion Status
- Week 1: 0% (0/3 tasks)
- Week 2: 0% (0/2 tasks)
- Week 3: 0% (0/3 tasks)
- **Overall: 0% (0/8 tasks)**

### Files Status
- Files to delete: 0/5 ⬜
- Files to refactor: 0/15+ ⬜
- Tests passing: ⬜
- Documentation updated: ⬜

---

## 🎯 Success Metrics

### Code Quality
- [ ] No duplicate Supabase clients
- [ ] No duplicate type definitions
- [ ] No duplicate hooks
- [ ] No duplicate schemas
- [ ] All imports from single source

### Testing
- [ ] All TypeScript errors resolved
- [ ] All tests passing
- [ ] No console errors
- [ ] Manual testing complete
- [ ] Staging deployment successful

### Documentation
- [ ] README files updated
- [ ] Migration guide created
- [ ] Quick reference guide complete
- [ ] CHANGELOG updated
- [ ] Team notified

---

## 🚨 Issues & Blockers

### Current Issues
_None yet_

### Resolved Issues
_None yet_

---

## 📝 Notes & Learnings

### Week 1 Notes
_Add notes here_

### Week 2 Notes
_Add notes here_

### Week 3 Notes
_Add notes here_

---

## 🎉 Completion Checklist

- [ ] All duplicate files removed
- [ ] All imports updated
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Staging deployment successful
- [ ] Production deployment successful
- [ ] Team trained on new structure
- [ ] This tracker archived

---

## 📅 Timeline

| Week | Focus | Status | Completion Date |
|------|-------|--------|-----------------|
| Week 1 | Critical Fixes | 🔴 Not Started | - |
| Week 2 | Type Definitions | 🔴 Not Started | - |
| Week 3 | Cleanup & Docs | 🔴 Not Started | - |

**Legend:**
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Complete
- ⚠️ Blocked

---

## 🔄 Update Log

| Date | Update | By |
|------|--------|-----|
| [Date] | Tracker created | [Name] |

---

**Last Updated:** [Date]  
**Next Review:** [Date]

