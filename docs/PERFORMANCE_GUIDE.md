# 🚀 Performance Optimization Guide

## Overview

Panduan lengkap untuk menggunakan fitur-fitur optimasi performa di HeyTrack.

---

## 📚 Table of Contents

1. [Array Operations](#array-operations)
2. [Memoization](#memoization)
3. [Virtual Scrolling](#virtual-scrolling)
4. [Web Workers](#web-workers)
5. [API Caching](#api-caching)
6. [Query Optimization](#query-optimization)
7. [Image Optimization](#image-optimization)
8. [Performance Monitoring](#performance-monitoring)

---

## Array Operations

### Problem
```typescript
// ❌ Slow - multiple iterations
const total = orders.reduce((sum, o) => sum + o.total_amount, 0)
const avg = orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length
const grouped = orders.reduce((groups, o) => {
  if (!groups[o.status]) groups[o.status] = []
  groups[o.status].push(o)
  return groups
}, {})
```

### Solution
```typescript
// ✅ Fast - optimized helpers
import { arrayCalculations } from '@/lib/performance-optimized'

const total = arrayCalculations.sum(orders, 'total_amount')
const avg = arrayCalculations.average(orders, 'total_amount')
const grouped = arrayCalculations.groupBy(orders, 'status')
const unique = arrayCalculations.unique(orders, 'customer_id')
```

### Available Functions
- `sum(array, key)` - Sum values
- `average(array, key)` - Calculate average
- `groupBy(array, key)` - Group by key
- `unique(array, key)` - Get unique values

---

## Memoization

### useMemo for Expensive Calculations
```typescript
import { useMemo } from 'react'

// ✅ Memoize expensive calculation
const calculatedPrice = useMemo(() => {
  return recipe.total_cost * (1 + marginPercentage / 100)
}, [recipe.total_cost, marginPercentage])
```

### useCallback for Functions
```typescript
import { useCallback } from 'react'

// ✅ Memoize callback
const handleSave = useCallback(() => {
  updatePrice.mutate({ recipeId, price, margin })
}, [recipeId, price, margin])
```

### memo for Components
```typescript
import { memo } from 'react'

// ✅ Memoize component
export const OrderCard = memo(function OrderCard({ order }) {
  return <div>...</div>
})
```

### Custom Hooks
```typescript
import { useExpensiveCalculation } from '@/lib/performance-optimized'

// ✅ Use helper hook
const result = useExpensiveCalculation(
  data,
  (d) => complexCalculation(d),
  [dependency]
)
```

---

## Virtual Scrolling

### When to Use
- Lists with 100+ items
- Tables with many rows
- Infinite scroll scenarios

### Implementation
```typescript
import { VirtualizedList } from '@/components/optimized/VirtualizedList'

<VirtualizedList
  items={orders}
  itemHeight={80}
  containerHeight={600}
  renderItem={(order, index) => (
    <OrderCard key={order.id} order={order} />
  )}
  keyExtractor={(order) => order.id}
  emptyMessage="Tidak ada order"
/>
```

### Benefits
- Render only visible items
- Smooth scrolling
- Low memory usage
- Fast initial load

---

## Web Workers

### HPP Calculator Worker

#### When to Use
- Heavy calculations (>100ms)
- Complex data processing
- Prevent UI blocking

#### Implementation
```typescript
import { useHppCalculatorWorker } from '@/hooks/useHppCalculatorWorker'

function HppCalculator() {
  const { calculate, isCalculating, error } = useHppCalculatorWorker()

  const handleCalculate = async () => {
    try {
      const result = await calculate({
        ingredients: recipe.ingredients,
        operationalCost: 50000,
        batchSize: 10
      })
      
      setHppResult(result)
    } catch (err) {
      console.error('Calculation failed:', err)
    }
  }

  return (
    <Button onClick={handleCalculate} disabled={isCalculating}>
      {isCalculating ? 'Calculating...' : 'Calculate HPP'}
    </Button>
  )
}
```

#### Benefits
- Non-blocking UI
- Faster perceived performance
- Better user experience

---

## API Caching

### HTTP Caching Headers
```typescript
import { createCachedResponse, cachePresets } from '@/lib/api-cache'

export async function GET() {
  const data = await fetchData()
  
  // Static data (rarely changes)
  return createCachedResponse(data, cachePresets.static)
  
  // Dynamic data (changes frequently)
  return createCachedResponse(data, cachePresets.dynamic)
  
  // Private data (user-specific)
  return createCachedResponse(data, cachePresets.private)
  
  // Real-time data (no cache)
  return createCachedResponse(data, cachePresets.realtime)
}
```

### In-Memory Cache
```typescript
import { apiCache, cachedFetch } from '@/lib/api-cache'

// Cache API response
const data = await cachedFetch(
  'recipes-list',
  () => fetchRecipes()
)

// Invalidate cache
import { cacheInvalidation } from '@/lib/api-cache'

// Invalidate specific resource
cacheInvalidation.invalidateResource('recipes')

// Invalidate by pattern
cacheInvalidation.invalidatePattern(/^orders-/)

// Clear all
cacheInvalidation.clearAll()
```

### Cache Presets
- `static` - 1 hour cache, 1 day stale
- `dynamic` - 1 minute cache, 5 minutes stale
- `private` - 30 seconds cache, 1 minute stale
- `realtime` - No cache

---

## Query Optimization

### Select Only Needed Fields
```typescript
import { selectFields } from '@/lib/query-optimization'

// ❌ Bad - fetch all fields
const { data } = await supabase
  .from('recipes')
  .select('*')

// ✅ Good - fetch only needed fields
const { data } = await supabase
  .from('recipes')
  .select(selectFields.recipeMinimal)
```

### Use Query Filters
```typescript
import { queryFilters } from '@/lib/query-optimization'

let query = supabase.from('recipes').select('*')

// Active only
query = queryFilters.activeOnly(query)

// Date range
query = queryFilters.dateRange(query, 'created_at', from, to)

// Recent records
query = queryFilters.recent(query, 'created_at', 7)

// Paginated
query = queryFilters.paginated(query, page, pageSize)
```

### Query Builder
```typescript
import { queryBuilder } from '@/lib/query-optimization'

const query = queryBuilder.buildOrderQuery(baseQuery, {
  status: 'pending',
  paymentStatus: 'unpaid',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
})
```

### Batch Operations
```typescript
import { batchOperations } from '@/lib/query-optimization'

// Batch insert
await batchOperations.batchInsert(supabase, 'orders', data, 100)

// Batch update
await batchOperations.batchUpdate(supabase, 'orders', updates, 100)

// Batch delete
await batchOperations.batchDelete(supabase, 'orders', ids)
```

---

## Image Optimization

### OptimizedImage Component
```typescript
import { OptimizedImage } from '@/components/optimized/OptimizedImage'

<OptimizedImage
  src="/images/product.jpg"
  alt="Product"
  width={400}
  height={300}
  quality={75}
  priority={false}
/>
```

### Avatar
```typescript
import { OptimizedAvatar } from '@/components/optimized/OptimizedImage'

<OptimizedAvatar
  src="/avatars/user.jpg"
  alt="User"
  size={40}
/>
```

### Logo
```typescript
import { OptimizedLogo } from '@/components/optimized/OptimizedImage'

<OptimizedLogo
  src="/logo.png"
  alt="HeyTrack"
  width={120}
  height={40}
  priority
/>
```

### Features
- Lazy loading
- Blur placeholder
- WebP/AVIF support
- Error handling
- Loading state

---

## Performance Monitoring

### Component Performance
```typescript
import { usePerformanceMonitor } from '@/lib/performance-optimized'

function MyComponent() {
  // Enable in development
  usePerformanceMonitor('MyComponent', process.env.NODE_ENV === 'development')
  
  return <div>...</div>
}
```

### Query Performance
```typescript
import { queryMonitor } from '@/lib/query-optimization'

// Start monitoring
const end = queryMonitor.start('fetchOrders')

// ... do query ...

// End monitoring
end()

// Get stats
const stats = queryMonitor.getStats()
console.log(stats)
```

### Web Vitals
```typescript
// Already configured in app/layout.tsx
import { reportWebVitals } from '@/lib/performance'

export function reportWebVitals(metric) {
  console.log(metric)
  // Send to analytics
}
```

---

## Best Practices

### 1. Memoization
- ✅ Memoize expensive calculations
- ✅ Memoize callbacks passed to children
- ✅ Memoize components that render often
- ❌ Don't over-memoize simple components

### 2. Array Operations
- ✅ Use helper functions for common operations
- ✅ Avoid multiple iterations
- ✅ Use memoization for filtered/sorted data
- ❌ Don't mutate arrays directly

### 3. API Calls
- ✅ Use appropriate cache strategy
- ✅ Select only needed fields
- ✅ Use pagination for large datasets
- ✅ Batch operations when possible
- ❌ Don't fetch all data at once

### 4. Images
- ✅ Use OptimizedImage component
- ✅ Set appropriate quality (75-85)
- ✅ Use lazy loading for below-fold images
- ✅ Provide width/height to prevent layout shift
- ❌ Don't use priority for all images

### 5. Lists
- ✅ Use virtual scrolling for 100+ items
- ✅ Use pagination for very large datasets
- ✅ Memoize list items
- ❌ Don't render all items at once

---

## Performance Checklist

### Before Deployment
- [ ] Run `pnpm build:analyze` to check bundle size
- [ ] Test with slow 3G network
- [ ] Check Lighthouse score (>90)
- [ ] Verify Core Web Vitals
- [ ] Test on mobile devices
- [ ] Check memory leaks
- [ ] Verify API response times
- [ ] Test with large datasets

### After Deployment
- [ ] Monitor Web Vitals
- [ ] Track API performance
- [ ] Monitor error rates
- [ ] Check bundle size trends
- [ ] Review user feedback
- [ ] Analyze slow queries

---

## Troubleshooting

### Slow Page Load
1. Check bundle size with `pnpm build:analyze`
2. Verify API response times
3. Check database indexes
4. Review component memoization
5. Check for memory leaks

### Slow List Rendering
1. Use virtual scrolling
2. Memoize list items
3. Reduce item complexity
4. Use pagination
5. Optimize images

### Slow API Responses
1. Add database indexes
2. Select only needed fields
3. Use caching
4. Optimize queries
5. Use batch operations

---

## Resources

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

**Last Updated:** 2024-10-27
