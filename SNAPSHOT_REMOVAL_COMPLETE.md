# Complete Snapshot Removal Plan

## Files to DELETE completely:
1. src/agents/automations/DailySnapshotsAgent.ts
2. src/modules/hpp/services/HppSnapshotAutomation.ts
3. src/modules/hpp/services/HppSnapshotService.ts
4. src/app/api/hpp/snapshots/route.ts
5. src/app/hpp/snapshots/page.tsx
6. src/modules/orders/components/hpp/HppTrendChart.tsx

## Files to MODIFY (remove snapshot references):
1. src/lib/cron/hpp.ts - Remove snapshot cron jobs
2. src/modules/orders/services/HppExportService.ts - Remove snapshot export
3. src/modules/hpp/hooks/useUnifiedHpp.ts - Remove snapshot hooks
4. src/modules/hpp/components/UnifiedHppPage.tsx - Remove snapshot UI
5. src/app/hpp/page.tsx - Remove snapshot navigation
6. Navigation files - Remove snapshot routes

## Database:
- Keep hpp_snapshots table for now (can be dropped later via migration)
- Keep hpp_snapshots_archive table for now

## Status: IN PROGRESS
