# Batch Migration Plan - Final Push

## Target: Complete Phase 1 & 2 (Except PascalCase)

### Phase 1: Constants Migration (Remaining ~10 files)

**Files to Migrate**:
1. ✅ src/app/api/dashboard/[...slug]/route.ts (partially done)
2. ⏳ src/components/orders/WhatsAppFollowUp.tsx
3. ⏳ src/hooks/api/useReports.ts
4. ⏳ src/lib/automation/workflows/order-workflows.ts
5. ⏳ src/services/ai/AiService.ts
6. ⏳ src/app/production/components/EnhancedProductionPage.tsx
7. ⏳ src/components/dashboard/ProductionScheduleWidget.tsx
8. ⏳ src/components/production/components/ActiveBatchesList.tsx
9. ⏳ src/components/production/components/ProductionOverview.tsx
10. ⏳ src/components/orders/orders-table.tsx (partially done)

### Phase 2: Validation Schemas (Remaining ~20 files)

**Files to Migrate**:
1. ⏳ src/app/api/suppliers/import/route.ts
2. ⏳ src/app/api/financial/records/[[...slug]]/route.ts
3. ⏳ src/app/api/hpp/recommendations/[[...slug]]/route.ts
4. ⏳ src/app/api/admin/broadcast-update/route.ts
5. ⏳ src/app/api/admin/broadcast-realtime/route.ts
6. ⏳ src/app/api/recipes/cost-previews/route.ts
7. ⏳ src/app/api/recipes/generate/route.ts
8. ⏳ src/app/api/recipes/availability/route.ts
9. ⏳ src/app/api/production/suggestions/route.ts
10. ⏳ src/app/api/whatsapp-templates/[[...slug]]/route.ts
11. ⏳ src/app/api/orders/calculate-price/route.ts
12. ⏳ src/app/api/orders/import/route.ts
13. ⏳ src/app/api/onboarding/checklist/route.ts
14. ⏳ src/app/api/notifications/route.ts

## Strategy

1. **Batch Process**: Group similar files together
2. **Pattern Reuse**: Apply same patterns consistently
3. **Quick Validation**: Run type-check after each batch
4. **Progress Tracking**: Update metrics after each batch

## Estimated Time

- Phase 1 Completion: 30-45 minutes
- Phase 2 Completion: 45-60 minutes
- **Total**: ~90 minutes

Let's go! 🚀
