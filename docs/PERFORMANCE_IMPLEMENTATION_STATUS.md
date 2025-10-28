# Performance Optimization - Implementation Status

## ✅ Completed

### 1. Custom Hooks Created
- ✅ `src/hooks/useRecipes.ts` - TanStack Query hooks for recipes with caching
- ✅ `src/hooks/useProduction.ts` - TanStack Query hooks for production batches
- ✅ `src/hooks/useIngredients.ts` - TanStack Query hooks for ingredients

### 2. Utility Libraries Created
- ✅ `src/lib/utils/array-utils.ts` - Optimized array operations
- ✅ `src/lib/database/query-fields.ts` - Database query field selectors
- ✅ `src/components/charts/LazyCharts.tsx` - Lazy-loaded chart components

### 3. Documentation Created
- ✅ `docs/PERFORMANCE_IMPROVEMENTS.md` - Complete performance guide
- ✅ `docs/PERFORMANCE_QUICK_START.md` - Quick implementation guide

---

## 🔄 Ready to Implement (Next Steps)

### Phase 1: Update Components to Use Custom Hooks

#### 1. HPP Calculator Page
**File:** `src/app/hpp/calculator/page.tsx`

**Current:**
```typescript
useEffect(() => {
  const loadRecipes = async () => {
    const response = await fetch('/api/recipes?limit=1000')
    // ...
  }
  loadRecipes()
}, [])
```

**Replace with:**
```typescript
import { useRecipes } from '@/hooks/useRecipes'

// In component:
const { data, isLoading } = useRecipes({ limit: 1000 })
const recipes = data?.recipes || []
```

**Impact:** ⚡ Instant caching, no refetch on remount

---

#### 2. Production Page
**File:** `src/app/production/components/ProductionPage.tsx`

**Current:**
```typescript
const fetchProductions = async () => {
  const response = await fetch('/api/production-batches')
  // ...
}
```

**Replace with:**
```typescript
import { useProductionBatches } from '@/hooks/useProduction'

// In component:
const { data, isLoading } = useProductionBatches()
const productions = data || []
```

**Impact:** ⚡ Auto-refresh every 30s, background updates

---

#### 3. Enhanced Profit Report
**File:** `src/app/reports/components/EnhancedProfitReport.tsx`

**Current:**
```typescript
import { LineChart, BarChart, PieChart, ... } from 'recharts'
```

**Replace with:**
```typescript
import { 
  LazyLineChart, 
  LazyBarChart, 
  LazyPieChart,
  Line,
  Bar,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from '@/components/charts/LazyCharts'

// Then replace all chart components:
<LineChart> → <LazyLineChart>
<BarChart> → <LazyBarChart>
<PieChart> → <LazyPieChart>
```

**Impact:** ⚡ ~100KB smaller initial bundle

---

### Phase 2: Optimize Database Queries

#### Update API Routes to Use Specific Fields

**Example - Recipes API:**
```typescript
// Before
const { data } = await supabase
  .from('recipes')
  .select('*')

// After
import { RECIPE_FIELDS } from '@/lib/database/query-fields'

const { data } = await supabase
  .from('recipes')
  .select(RECIPE_FIELDS.LIST)
```

**Files to update:**
- `src/app/api/recipes/route.ts`
- `src/app/api/orders/route.ts`
- `src/app/api/ingredients/route.ts`
- `src/app/api/production-batches/route.ts`

**Impact:** ⚡ 30-50% less data transfer

---

### Phase 3: Add React.memo to Expensive Components

#### Components to Wrap:

1. **OrderCard** - Renders frequently in lists
2. **RecipeCard** - Heavy component with images
3. **IngredientRow** - Rendered in large lists
4. **ProductionBatchCard** - Complex calculations

**Example:**
```typescript
import { memo } from 'react'

export const OrderCard = memo(({ order, onUpdate }: OrderCardProps) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return (
    prevProps.order.id === nextProps.order.id &&
    prevProps.order.status === nextProps.order.status
  )
})
```

**Impact:** ⚡ 40-60% fewer re-renders

---

## 📊 Expected Performance Gains

### Before Optimization
- Initial bundle: ~500KB
- API calls per page: 5-10
- Time to Interactive: ~3.5s
- Re-renders per interaction: 10-15

### After Phase 1 (Hooks + Lazy Loading)
- Initial bundle: ~350KB (-30%)
- API calls per page: 1-3 (-70%)
- Time to Interactive: ~2.5s (-29%)
- Re-renders: 8-12 (-20%)

### After Phase 2 (Query Optimization)
- Initial bundle: ~350KB
- API calls per page: 1-3
- Time to Interactive: ~2.2s (-37%)
- Data transfer: -40%

### After Phase 3 (React.memo)
- Initial bundle: ~350KB
- API calls per page: 1-3
- Time to Interactive: ~2s (-43%)
- Re-renders: 3-5 (-70%)

---

## 🚀 Quick Implementation Commands

### 1. Test Bundle Size
```bash
ANALYZE=true pnpm build
```

### 2. Run Type Check
```bash
pnpm type-check
```

### 3. Test Performance
```bash
# Start dev server
pnpm dev

# In another terminal, run Lighthouse
npx lighthouse http://localhost:3000 --view
```

---

## 📝 Implementation Checklist

### Phase 1 (Today - 2 hours)
- [ ] Update HPP Calculator to use `useRecipes`
- [ ] Update Production Page to use `useProductionBatches`
- [ ] Update Profit Report to use Lazy Charts
- [ ] Test and verify caching works
- [ ] Run bundle analysis

### Phase 2 (Tomorrow - 3 hours)
- [ ] Update Recipes API to use `RECIPE_FIELDS`
- [ ] Update Orders API to use `ORDER_FIELDS`
- [ ] Update Ingredients API to use `INGREDIENT_FIELDS`
- [ ] Update Production API to use `PRODUCTION_FIELDS`
- [ ] Test API response sizes

### Phase 3 (Day 3 - 2 hours)
- [ ] Wrap OrderCard with React.memo
- [ ] Wrap RecipeCard with React.memo
- [ ] Wrap IngredientRow with React.memo
- [ ] Add useCallback to event handlers
- [ ] Test re-render counts

---

## 🔍 Monitoring & Validation

### Check Caching Works
1. Open DevTools > Network tab
2. Navigate to a page (e.g., /recipes)
3. Navigate away and back
4. Verify: No new API call (data from cache)

### Check Bundle Size
```bash
ANALYZE=true pnpm build
# Opens bundle analyzer in browser
```

### Check Performance Metrics
```bash
npx lighthouse http://localhost:3000 --view
```

Look for:
- First Contentful Paint (FCP) < 1.5s
- Time to Interactive (TTI) < 3s
- Total Blocking Time (TBT) < 300ms

---

## 🐛 Troubleshooting

### Issue: "useQuery is not defined"
**Solution:** Ensure QueryClientProvider is in `src/app/layout.tsx`

### Issue: "Data not updating after mutation"
**Solution:** Check `queryClient.invalidateQueries()` is called

### Issue: "Charts not loading"
**Solution:** Check dynamic imports, add error boundary

### Issue: "Type errors with hooks"
**Solution:** Run `pnpm type-check` and fix type mismatches

---

## 📚 Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React.memo Docs](https://react.dev/reference/react/memo)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)

---

## 🎯 Success Criteria

✅ Bundle size reduced by 30%+
✅ API calls reduced by 70%+
✅ Time to Interactive < 2.5s
✅ No type errors
✅ All tests passing
✅ Lighthouse score > 90

---

**Last Updated:** October 28, 2025
**Status:** Ready for Implementation
**Estimated Time:** 7 hours total (3 phases)
