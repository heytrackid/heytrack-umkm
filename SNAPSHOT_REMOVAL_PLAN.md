# Snapshot Feature Removal Plan

## Files to Delete

### Core Snapshot Files
- [ ] `src/agents/automations/DailySnapshotsAgent.ts`
- [ ] `src/modules/hpp/services/HppSnapshotAutomation.ts`
- [ ] `src/modules/hpp/services/HppSnapshotService.ts`
- [ ] `src/app/api/hpp/snapshots/route.ts`
- [ ] `src/app/hpp/snapshots/page.tsx`

### Files to Modify (Remove snapshot references)
- [ ] `src/agents/automations/HppAlertAgent.ts`
- [ ] `src/app/api/hpp/calculate/route.ts`
- [ ] `src/app/api/hpp/overview/route.ts`
- [ ] `src/app/dashboard/components/HppDashboardWidget.tsx`
- [ ] `src/hooks/index.ts`
- [ ] `src/lib/cache.ts`
- [ ] `src/lib/constants/hpp-config.ts`
- [ ] `src/lib/cron/hpp.ts`
- [ ] `src/lib/cron/index.ts`
- [ ] `src/lib/i18n/umkm-id.ts`
- [ ] `src/lib/index.ts`
- [ ] `src/lib/services/ChatSessionService.ts`
- [ ] `src/lib/validations/api-schemas.ts`
- [ ] `src/modules/hpp/components/HppOverviewCard.tsx`
- [ ] `src/modules/hpp/hooks/useHppOverview.ts`
- [ ] `src/modules/hpp/index.ts`
- [ ] `src/modules/hpp/services/HppAlertService.ts`

## Database Changes Needed
- Keep `hpp_snapshots` table (might be used for historical data)
- Or drop if not needed: `DROP TABLE IF EXISTS hpp_snapshots CASCADE;`

## Navigation/Routes to Update
- Remove from sidebar/navigation menu
- Remove route from app router
