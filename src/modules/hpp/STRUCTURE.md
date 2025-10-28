# HPP Module Structure

## Visual Overview

```
📦 src/modules/hpp/
│
├── 📄 index.ts                    # Public API - Import dari sini
├── 📄 README.md                   # Quick reference guide
├── 📄 MIGRATION.md                # Migration guide
├── 📄 STRUCTURE.md                # This file
│
├── 🎨 components/                 # UI Components
│   ├── UnifiedHppPage.tsx        # ⭐ Main HPP page (4 langkah)
│   ├── HppCalculatorSkeleton.tsx # Loading skeleton
│   ├── HppQuickStats.tsx         # Quick stats widget
│   ├── HppCostTrendsChart.tsx    # Cost trends visualization
│   └── RecentSnapshotsTable.tsx  # Recent snapshots table
│
├── ⚙️ services/                   # Business Logic Services
│   ├── HppCalculatorService.ts   # 🧮 HPP calculation engine
│   ├── HppSnapshotService.ts     # 📸 Daily snapshots
│   ├── HppAlertService.ts        # 🚨 Alert detection
│   └── HppExportService.ts       # 📊 Export to CSV/Excel/PDF
│
├── 🪝 hooks/                      # React Hooks
│   ├── useUnifiedHpp.ts          # ⭐ Main HPP hook
│   ├── useHppOverview.ts         # Overview data
│   ├── useHppWorker.ts           # Web Worker for calculations
│   ├── useHppCalculatorWorker.ts # Calculator worker
│   └── useInfiniteHppAlerts.ts   # Infinite scroll alerts
│
├── 📝 types/                      # TypeScript Types
│   └── index.ts                  # All HPP type definitions
│
└── 🛠️ utils/                      # Utility Functions
    ├── calculations.ts           # Calculation helpers
    └── index.ts                  # Utils exports
```

## Component Hierarchy

```
UnifiedHppPage (Main)
├── HppQuickStats
│   └── Overview metrics
├── Recipe Selection
│   └── Select dropdown
├── HPP Calculator
│   ├── Ingredients list
│   ├── Operational costs
│   └── Total cost breakdown
├── Price Determination
│   ├── Margin slider
│   ├── Suggested price
│   └── Tips & recommendations
├── Comparison
│   └── HppCostTrendsChart
└── Alerts
    └── Alert list with actions
```

## Service Dependencies

```
HppCalculatorService
├── Calculates material costs
├── Calculates labor costs
├── Calculates overhead costs
├── Applies WAC adjustment
└── Saves to database

HppSnapshotService
├── Creates daily snapshots
├── Archives old data
└── Provides trend data

HppAlertService
├── Detects price increases
├── Detects low margins
├── Detects cost spikes
└── Manages alert lifecycle

HppExportService
├── Exports to CSV
├── Exports to JSON
└── Exports to PDF
```

## Data Flow

```
User Action
    ↓
Component (UnifiedHppPage)
    ↓
Hook (useUnifiedHpp)
    ↓
API Route (/api/hpp/*)
    ↓
Service (HppCalculatorService)
    ↓
Database (Supabase)
    ↓
Response
    ↓
React Query Cache
    ↓
Component Update
```

## Import Patterns

### ✅ Recommended (Single Import)
```typescript
import { 
  UnifiedHppPage,
  HppCalculatorService,
  useUnifiedHpp,
  HppCalculation 
} from '@/modules/hpp'
```

### ✅ Specific Import
```typescript
import { HppCalculatorService } from '@/modules/hpp/services/HppCalculatorService'
```

### ❌ Avoid (Old Pattern)
```typescript
import { UnifiedHppPage } from '@/components/hpp/UnifiedHppPage'
import { useUnifiedHpp } from '@/hooks/useUnifiedHpp'
```

## File Sizes

| File | Lines | Purpose |
|------|-------|---------|
| UnifiedHppPage.tsx | ~500 | Main UI component |
| HppCalculatorService.ts | ~300 | Calculation logic |
| HppSnapshotService.ts | ~150 | Snapshot management |
| HppAlertService.ts | ~200 | Alert detection |
| useUnifiedHpp.ts | ~200 | Main data hook |
| types/index.ts | ~100 | Type definitions |

## API Endpoints

| Method | Endpoint | Service |
|--------|----------|---------|
| POST | /api/hpp/calculate | HppCalculatorService |
| GET | /api/hpp/overview | Multiple services |
| GET | /api/hpp/snapshots | HppSnapshotService |
| GET | /api/hpp/alerts | HppAlertService |
| PATCH | /api/hpp/alerts/:id/read | HppAlertService |
| GET | /api/hpp/comparison | Multiple services |

## Database Tables

| Table | Purpose | Service |
|-------|---------|---------|
| hpp_calculations | Calculation history | HppCalculatorService |
| hpp_snapshots | Daily snapshots | HppSnapshotService |
| hpp_alerts | Alert notifications | HppAlertService |
| recipes | Recipe data | All services |
| ingredients | Ingredient data | HppCalculatorService |

## Cron Jobs

| Job | Schedule | Service |
|-----|----------|---------|
| Daily Snapshots | 00:00 daily | HppSnapshotService |
| Alert Detection | Every 5 min | HppAlertService |
| Archive Old Data | Weekly | HppSnapshotService |

## Type Definitions

```typescript
// Main types
HppCalculation          // Calculation result
HppSnapshot            // Daily snapshot
HppAlert               // Alert notification
HppOverview            // Overview stats
HppComparison          // Comparison data
RecipeWithHpp          // Recipe with HPP data

// Helper types
MaterialBreakdown      // Ingredient cost breakdown
HppExportOptions       // Export configuration
HppExportResult        // Export result
```

## Key Features

### 1. 🧮 HPP Calculator
- Automatic cost calculation
- Material + Labor + Overhead
- WAC adjustment
- Per-unit cost

### 2. 💰 Price Suggestion
- Margin-based pricing
- Market comparison
- Competitor analysis
- Risk assessment

### 3. 📊 Trend Analysis
- Daily snapshots
- Historical comparison
- Cost trends
- Margin trends

### 4. 🚨 Smart Alerts
- Price increase detection
- Low margin warning
- Cost spike alert
- Ingredient unavailable

### 5. 📈 Comparison
- Multi-recipe comparison
- Profitability ranking
- Category analysis
- Performance metrics

## Performance Optimizations

- ✅ React Query caching (5 min)
- ✅ Web Workers for heavy calculations
- ✅ Lazy loading components
- ✅ Memoized calculations
- ✅ Optimistic updates
- ✅ Debounced inputs

## Testing Strategy

```
Unit Tests
├── Services (calculation logic)
├── Utilities (helper functions)
└── Type guards

Integration Tests
├── API routes
├── Database operations
└── Service interactions

E2E Tests
├── User workflows
├── HPP calculation flow
└── Alert notifications
```

## Maintenance Checklist

- [ ] Review alert thresholds monthly
- [ ] Monitor cron job performance
- [ ] Archive old data quarterly
- [ ] Update calculation logic as needed
- [ ] Review and optimize queries
- [ ] Update documentation
- [ ] Check for type errors
- [ ] Run performance tests

## Future Enhancements

- [ ] Batch calculation optimization
- [ ] Advanced analytics dashboard
- [ ] ML-based price prediction
- [ ] Multi-currency support
- [ ] Custom alert rules
- [ ] Export templates
- [ ] Mobile app integration
- [ ] Real-time collaboration

## Support & Resources

- 📚 [Full Documentation](../../docs/HPP_MODULE.md)
- 🔄 [Migration Guide](./MIGRATION.md)
- 📖 [Quick Reference](./README.md)
- 🏗️ [Project Structure](../../.kiro/steering/structure.md)

---

**Last Updated**: October 27, 2024  
**Version**: 1.0.0  
**Maintainer**: Development Team
