# HPP Module - Quick Reference Card

## 🚀 Quick Start

### Import Everything
```typescript
import { 
  // Components
  UnifiedHppPage,
  HppCalculatorSkeleton,
  HppQuickStats,
  
  // Services
  HppCalculatorService,
  HppSnapshotService,
  HppAlertService,
  
  // Hooks
  useUnifiedHpp,
  useHppOverview,
  
  // Types
  HppCalculation,
  HppAlert,
  HppSnapshot
} from '@/modules/hpp'
```

---

## 📦 Services

### HppCalculatorService
```typescript
const service = new HppCalculatorService()

// Calculate HPP
const result = await service.calculateRecipeHpp(recipeId)
// Returns: { totalHpp, materialCost, laborCost, overheadCost, ... }

// Get latest HPP
const latest = await service.getLatestHpp(recipeId)
```

### HppSnapshotService
```typescript
const service = new HppSnapshotService()

// Create snapshot for one recipe
await service.createSnapshot(recipeId)

// Create snapshots for all recipes
const result = await service.createDailySnapshots()
// Returns: { success: number, failed: number }

// Get snapshots
const snapshots = await service.getSnapshots(recipeId, startDate, endDate)

// Archive old snapshots (>90 days)
const count = await service.archiveOldSnapshots()
```

### HppAlertService
```typescript
const service = new HppAlertService()

// Detect alerts for one recipe
const alerts = await service.detectAlertsForRecipe(recipeId)

// Detect alerts for all recipes
const result = await service.detectAlertsForAllRecipes()
// Returns: { success, failed, totalAlerts }

// Mark alert as read
await service.markAsRead(alertId)

// Get unread alerts
const alerts = await service.getUnreadAlerts(userId, limit)
```

---

## 🪝 Hooks

### useUnifiedHpp
```typescript
const {
  // Data
  recipes,        // All recipes
  overview,       // Overview stats
  recipe,         // Selected recipe
  comparison,     // Comparison data
  alerts,         // Unread alerts
  
  // Loading
  isLoading,
  recipeLoading,
  
  // Actions
  selectedRecipeId,
  setSelectedRecipeId,
  calculateHpp,   // Mutation
  updatePrice,    // Mutation
  markAlertAsRead // Mutation
} = useUnifiedHpp()
```

### useHppOverview
```typescript
const { data, isLoading } = useHppOverview()
// data: { totalRecipes, recipesWithHpp, averageHpp, unreadAlerts }
```

---

## 🛠️ Utilities

### Calculations
```typescript
import { 
  calculateMarginPercentage,
  calculateSuggestedPrice,
  calculateOperationalCost,
  roundToNearestHundred
} from '@/modules/hpp/utils'

// Margin percentage
const margin = calculateMarginPercentage(50000, 30000) // 40%

// Suggested price
const price = calculateSuggestedPrice(30000, 60) // 48000

// Operational cost (15% of material)
const opCost = calculateOperationalCost(20000) // 3000

// Round price
const rounded = roundToNearestHundred(48750) // 48800
```

---

## 📝 Types

### Main Types
```typescript
interface HppCalculation {
  id: string
  recipe_id: string
  material_cost: number
  labor_cost: number
  overhead_cost: number
  total_hpp: number
  cost_per_unit: number
  wac_adjustment: number
}

interface HppSnapshot {
  id: string
  recipe_id: string
  snapshot_date: string
  hpp_value: number
  selling_price?: number
  margin_percentage?: number
}

interface HppAlert {
  id: string
  recipe_id: string
  alert_type: 'PRICE_INCREASE' | 'MARGIN_LOW' | 'COST_SPIKE'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  is_read: boolean
}
```

---

## 🌐 API Routes

### Calculate HPP
```typescript
// POST /api/hpp/calculate
const response = await fetch('/api/hpp/calculate', {
  method: 'POST',
  body: JSON.stringify({ recipeId })
})
```

### Get Overview
```typescript
// GET /api/hpp/overview
const response = await fetch('/api/hpp/overview')
```

### Get Snapshots
```typescript
// GET /api/hpp/snapshots?recipeId=xxx&startDate=xxx
const response = await fetch('/api/hpp/snapshots?' + params)
```

### Get Alerts
```typescript
// GET /api/hpp/alerts?is_read=false&limit=10
const response = await fetch('/api/hpp/alerts?' + params)
```

### Mark Alert as Read
```typescript
// PATCH /api/hpp/alerts/:id/read
const response = await fetch(`/api/hpp/alerts/${alertId}/read`, {
  method: 'PATCH'
})
```

---

## ⏰ Cron Jobs

### Daily Snapshots
```typescript
import { HPPCronJobs } from '@/lib/cron/hpp'

// Run daily at 00:00
await HPPCronJobs.createDailyHPPSnapshots()
```

### Alert Detection
```typescript
// Run every 5 minutes
await HPPCronJobs.detectHPPAlertsForAllUsers()
```

### Archive Old Data
```typescript
// Run weekly
await HPPCronJobs.archiveOldHPPSnapshots()
```

---

## 🎨 Component Usage

### UnifiedHppPage
```typescript
import { UnifiedHppPage } from '@/modules/hpp'

function HppRoute() {
  return (
    <AppLayout>
      <UnifiedHppPage />
    </AppLayout>
  )
}
```

### HppQuickStats
```typescript
import { HppQuickStats } from '@/modules/hpp'

function Dashboard() {
  return (
    <div>
      <HppQuickStats />
    </div>
  )
}
```

---

## 🔍 Common Patterns

### Calculate and Save
```typescript
const service = new HppCalculatorService()

// Calculate
const result = await service.calculateRecipeHpp(recipeId)

// Result is automatically saved to database
console.log(`HPP: ${result.totalHpp}`)
```

### Create Snapshot and Detect Alerts
```typescript
const snapshotService = new HppSnapshotService()
const alertService = new HppAlertService()

// Create snapshot
await snapshotService.createSnapshot(recipeId)

// Detect alerts (compares with previous snapshot)
const alerts = await alertService.detectAlertsForRecipe(recipeId)
```

### Use in Component with Hook
```typescript
function MyComponent() {
  const { 
    recipe, 
    calculateHpp, 
    updatePrice 
  } = useUnifiedHpp()
  
  const handleCalculate = () => {
    calculateHpp.mutate(recipe.id)
  }
  
  const handleSavePrice = (price: number) => {
    updatePrice.mutate({ 
      recipeId: recipe.id, 
      price, 
      margin: 60 
    })
  }
  
  return (
    <div>
      <button onClick={handleCalculate}>Calculate</button>
      <button onClick={() => handleSavePrice(50000)}>Save Price</button>
    </div>
  )
}
```

---

## 🐛 Error Handling

### Service Level
```typescript
try {
  const result = await service.calculateRecipeHpp(recipeId)
} catch (error) {
  logger.error({ error }, 'Failed to calculate HPP')
  throw error
}
```

### Component Level
```typescript
const { calculateHpp } = useUnifiedHpp()

const handleCalculate = async () => {
  try {
    await calculateHpp.mutateAsync(recipeId)
    toast.success('HPP calculated successfully')
  } catch (error) {
    toast.error('Failed to calculate HPP')
  }
}
```

---

## 📊 Performance Tips

1. **Use React Query caching**
   ```typescript
   // Data is cached for 5 minutes
   const { data } = useHppOverview()
   ```

2. **Batch operations**
   ```typescript
   // Create snapshots for all recipes at once
   await snapshotService.createDailySnapshots()
   ```

3. **Lazy load components**
   ```typescript
   const HppPage = lazy(() => import('@/modules/hpp'))
   ```

4. **Use Web Workers for heavy calculations**
   ```typescript
   const { result } = useHppWorker(data)
   ```

---

## 🔗 Links

- [Full Documentation](../../docs/HPP_MODULE.md)
- [Migration Guide](./MIGRATION.md)
- [Structure Overview](./STRUCTURE.md)
- [Module README](./README.md)

---

**Last Updated**: October 27, 2024  
**Version**: 1.0.0
