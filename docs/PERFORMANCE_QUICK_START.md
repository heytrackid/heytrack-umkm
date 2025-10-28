# Performance Optimization - Quick Start Guide

## 🚀 Implementasi Cepat (30 menit)

### Step 1: Install Dependencies (Sudah ada)

TanStack Query sudah terinstall di `package.json`. Pastikan sudah di-wrap dengan QueryClientProvider.

### Step 2: Gunakan Custom Hooks untuk Data Fetching

#### Before (Tidak Optimal):
```typescript
// ❌ Fetch manual tanpa caching
const [recipes, setRecipes] = useState([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  const fetchRecipes = async () => {
    setLoading(true)
    const response = await fetch('/api/recipes')
    const data = await response.json()
    setRecipes(data.recipes)
    setLoading(false)
  }
  fetchRecipes()
}, [])
```

#### After (Optimal):
```typescript
// ✅ Dengan caching otomatis
import { useRecipes } from '@/hooks/useRecipes'

const { data, isLoading } = useRecipes({ limit: 100 })
const recipes = data?.recipes || []
```

### Step 3: Lazy Load Charts

#### Before:
```typescript
// ❌ Import langsung (masuk initial bundle)
import { LineChart, Line, XAxis, YAxis } from 'recharts'
```

#### After:
```typescript
// ✅ Lazy load (hanya load saat dibutuhkan)
import { 
  LazyLineChart, 
  Line, 
  XAxis, 
  YAxis 
} from '@/components/charts/LazyCharts'
```

### Step 4: Optimasi Database Queries

#### Before:
```typescript
// ❌ Fetch semua field
const { data } = await supabase
  .from('recipes')
  .select('*')
```

#### After:
```typescript
// ✅ Hanya fetch field yang dibutuhkan
import { RECIPE_FIELDS } from '@/lib/database/query-fields'

const { data } = await supabase
  .from('recipes')
  .select(RECIPE_FIELDS.LIST)
```

### Step 5: Optimasi Array Operations

#### Before:
```typescript
// ❌ Multiple iterations
const filtered = items.filter(item => item.active)
const mapped = filtered.map(item => item.name)
const sliced = mapped.slice(0, 10)
```

#### After:
```typescript
// ✅ Single iteration dengan utility
import { filterMapSlice } from '@/lib/utils/array-utils'

const result = filterMapSlice(
  items,
  item => item.active,
  item => item.name,
  10
)
```

---

## 📊 Files yang Perlu Diupdate

### Priority 1 (Hari ini):

1. **src/app/production/components/ProductionPage.tsx**
   ```typescript
   // Replace fetch dengan:
   import { useProductionBatches } from '@/hooks/useProduction'
   const { data, isLoading } = useProductionBatches()
   ```

2. **src/app/hpp/calculator/page.tsx**
   ```typescript
   // Replace fetch dengan:
   import { useRecipes } from '@/hooks/useRecipes'
   const { data, isLoading } = useRecipes({ limit: 1000 })
   ```

3. **src/app/reports/components/EnhancedProfitReport.tsx**
   ```typescript
   // Lazy load charts:
   import { LazyBarChart, LazyPieChart } from '@/components/charts/LazyCharts'
   ```

### Priority 2 (Minggu ini):

4. **src/app/ingredients/purchases/components/IngredientPurchasesLayout.tsx**
5. **src/app/hpp/wac/page.tsx**
6. **src/app/hpp/comparison/page.tsx**
7. **src/app/hpp/pricing-assistant/page.tsx**

---

## 🎯 Expected Results

### Before:
- Initial bundle: ~500KB
- API calls per page: 5-10
- Time to Interactive: ~3.5s
- Re-renders: 10-15 per interaction

### After (Quick Wins):
- Initial bundle: ~350KB (-30%)
- API calls per page: 1-3 (-70%)
- Time to Interactive: ~2.5s (-29%)
- Re-renders: 5-8 per interaction (-50%)

---

## 🔍 Monitoring

### Check Bundle Size:
```bash
ANALYZE=true pnpm build
```

### Check Performance:
```bash
# Run Lighthouse
npx lighthouse http://localhost:3000 --view

# Or use Chrome DevTools > Lighthouse tab
```

### Check Network Requests:
1. Open Chrome DevTools > Network tab
2. Navigate to a page
3. Count API requests
4. Check if data is cached on subsequent visits

---

## 📝 Checklist

- [ ] Install TanStack Query (sudah ada)
- [ ] Create custom hooks (useRecipes, useProduction)
- [ ] Update 3 most-used pages to use hooks
- [ ] Lazy load all charts
- [ ] Use optimized query fields
- [ ] Test bundle size reduction
- [ ] Test API call reduction
- [ ] Verify caching works

---

## 🚨 Common Issues

### Issue 1: "useQuery is not defined"
**Solution:** Make sure QueryClientProvider wraps your app in `src/app/layout.tsx`

### Issue 2: "Data not updating after mutation"
**Solution:** Use `queryClient.invalidateQueries()` after mutations

### Issue 3: "Charts not loading"
**Solution:** Check that dynamic imports are working, add error boundary

---

## 📚 Next Steps

After implementing quick wins:

1. Add React.memo to expensive components
2. Add useCallback/useMemo where needed
3. Implement virtual scrolling for large lists
4. Add image optimization
5. Optimize remaining pages

See `docs/PERFORMANCE_IMPROVEMENTS.md` for full details.
