# Checklist Migrasi ke Enhanced Ingredients

## 📋 Pre-Migration

- [ ] Backup database
- [ ] Backup current code (create branch)
- [ ] Review current implementation
- [ ] Identify custom modifications
- [ ] Plan downtime (if needed)
- [ ] Notify team members

## 🔧 Installation

- [ ] Verify all dependencies installed
- [ ] Check TypeScript version compatibility
- [ ] Ensure shadcn/ui components up to date
- [ ] Install any missing UI components:
  ```bash
  npx shadcn-ui@latest add checkbox
  npx shadcn-ui@latest add popover
  npx shadcn-ui@latest add alert-dialog
  ```

## 📁 File Structure

- [ ] Create `src/components/ingredients/` directory
- [ ] Copy all new component files:
  - [ ] `EnhancedEmptyState.tsx`
  - [ ] `StockBadge.tsx`
  - [ ] `EnhancedIngredientForm.tsx`
  - [ ] `IngredientFilters.tsx`
  - [ ] `MobileIngredientCard.tsx`
  - [ ] `BulkActions.tsx`
  - [ ] `EnhancedIngredientsPage.tsx`
  - [ ] `index.ts`
  - [ ] `README.md`
- [ ] Create `src/lib/ingredients-toast.ts`
- [ ] Create documentation files in `docs/`:
  - [ ] `INGREDIENTS_UX_EVALUATION.md`
  - [ ] `INGREDIENTS_UX_IMPLEMENTATION.md`
  - [ ] `INGREDIENTS_MIGRATION_CHECKLIST.md` (this file)

## 🔄 Code Migration

### Step 1: Update Imports

- [ ] Update `src/app/ingredients/page.tsx`:
  ```tsx
  // Before
  import { IngredientsCRUD } from '@/components/crud/ingredients-crud'
  
  // After
  import { EnhancedIngredientsPage } from '@/components/ingredients/EnhancedIngredientsPage'
  ```

### Step 2: Replace Component

- [ ] Replace `<IngredientsCRUD />` with `<EnhancedIngredientsPage />`
- [ ] Remove old stats cards (now handled internally)
- [ ] Remove old alert components (now handled internally)

### Step 3: Update Toast Usage

- [ ] Replace generic toast calls with specific helpers:
  ```tsx
  // Before
  toast({ title: 'Success', description: 'Ingredient created' })
  
  // After
  import { ingredientCreatedToast } from '@/lib/ingredients-toast'
  toast(ingredientCreatedToast(name))
  ```

### Step 4: Update API Calls (if needed)

- [ ] Verify API endpoints compatibility
- [ ] Update error handling to use new toast helpers
- [ ] Test bulk operations endpoints

## 🧪 Testing

### Unit Tests

- [ ] Test `StockBadge` component
- [ ] Test `IngredientFilters` logic
- [ ] Test `BulkActions` selection
- [ ] Test form validation
- [ ] Test toast notifications

### Integration Tests

- [ ] Test create ingredient flow
- [ ] Test edit ingredient flow
- [ ] Test delete ingredient flow
- [ ] Test bulk delete flow
- [ ] Test bulk export flow
- [ ] Test filter and sort
- [ ] Test search functionality

### Mobile Testing

- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test on tablet
- [ ] Verify touch targets (min 44x44px)
- [ ] Test expandable cards
- [ ] Test quick actions

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Accessibility Testing

- [ ] Keyboard navigation
- [ ] Screen reader (NVDA/JAWS)
- [ ] Color contrast
- [ ] Focus indicators
- [ ] ARIA labels

## 🎨 UI/UX Verification

- [ ] Empty state displays correctly
- [ ] Stock badges show correct colors
- [ ] Filters work as expected
- [ ] Sort options work correctly
- [ ] Mobile cards display properly
- [ ] Bulk selection works
- [ ] Modals open/close correctly
- [ ] Toast notifications appear
- [ ] Loading states show
- [ ] Error states display

## 📊 Performance Check

- [ ] Page load time < 2s
- [ ] Search response < 300ms
- [ ] Filter response < 100ms
- [ ] No memory leaks
- [ ] Smooth scrolling
- [ ] No layout shifts

## 🔒 Security Review

- [ ] Input validation working
- [ ] XSS protection in place
- [ ] CSRF tokens valid
- [ ] API authentication working
- [ ] RLS policies enforced

## 📝 Documentation

- [ ] Update user guide
- [ ] Update API documentation
- [ ] Create video tutorial (optional)
- [ ] Update team wiki
- [ ] Document breaking changes
- [ ] Update changelog

## 🚀 Deployment

### Staging

- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] UAT with team members
- [ ] Collect feedback
- [ ] Fix critical issues

### Production

- [ ] Schedule deployment window
- [ ] Notify users (if needed)
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Monitor user feedback

## 📈 Post-Deployment

### Monitoring (First 24 Hours)

- [ ] Check error rates
- [ ] Monitor API response times
- [ ] Check user engagement metrics
- [ ] Review user feedback
- [ ] Monitor support tickets

### Week 1

- [ ] Collect user feedback
- [ ] Analyze usage patterns
- [ ] Identify pain points
- [ ] Plan quick fixes
- [ ] Update documentation based on feedback

### Week 2-4

- [ ] Implement quick fixes
- [ ] Optimize performance
- [ ] Add requested features
- [ ] Update training materials
- [ ] Plan next iteration

## 🐛 Rollback Plan

If critical issues occur:

1. [ ] Identify issue severity
2. [ ] Attempt quick fix (< 30 min)
3. [ ] If not fixable, rollback:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
4. [ ] Notify team
5. [ ] Restore database (if needed)
6. [ ] Post-mortem analysis
7. [ ] Plan fix for next deployment

## ✅ Sign-Off

- [ ] Developer approval
- [ ] QA approval
- [ ] Product owner approval
- [ ] Stakeholder approval

## 📞 Support

### Issues?

- Check documentation: `/docs/INGREDIENTS_UX_IMPLEMENTATION.md`
- Review code: `/src/components/ingredients/`
- Contact: development-team@heytrack.com

### Emergency Contacts

- Tech Lead: [Name]
- DevOps: [Name]
- Product Owner: [Name]

---

**Migration Date:** _____________  
**Completed By:** _____________  
**Approved By:** _____________  
**Notes:**

_____________________________________________
_____________________________________________
_____________________________________________
