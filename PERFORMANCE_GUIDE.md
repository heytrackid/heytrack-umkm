# Performance Optimization Guide 🚀

## Quick Start

Aplikasi HeyTrack sudah dilengkapi dengan berbagai optimasi performa. Berikut cara menggunakannya:

### 1. Virtual Scrolling untuk List Panjang

```tsx
import { VirtualScroll } from '@/lib/performance'

function MyLongList({ items }) {
  return (
    <VirtualScroll
      items={items}
      height={600}
      itemHeight={80}
      renderItem={(item, index) => (
        <div key={item.id}>
          {item.name}
        </div>
      )}
    />
  )
}
```

### 2. Memoization untuk Component Berat

```tsx
import { memoShallow } from '@/lib/performance'

const HeavyComponent = memoShallow(({ data }) => {
  // Expensive rendering logic
  return <div>{/* ... */}</div>
})
```

### 3. Defer Loading untuk Non-Critical Content

```tsx
import { DeferredContent } from '@/lib/performance'

function MyPage() {
  return (
    <div>
      <CriticalContent />
      
      <DeferredContent delay={1000}>
        <NonCriticalWidget />
      </DeferredContent>
    </div>
  )
}
```

### 4. Optimized Images

```tsx
import { OptimizedImage } from '@/lib/performance'

function ProductCard({ product }) {
  return (
    <OptimizedImage
      src={product.image}
      alt={product.name}
      width={300}
      height={200}
      quality={75}
    />
  )
}
```

### 5. Lazy Load Heavy Libraries

```tsx
import { lazyImports } from '@/lib/performance'

async function exportToExcel() {
  const ExcelJS = await lazyImports.exceljs()
  const workbook = new ExcelJS.Workbook()
  // ... export logic
}
```

## Performance Monitoring

### Web Vitals Tracking

Aplikasi otomatis track Core Web Vitals:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTFB** (Time to First Byte): < 600ms

Data dikirim ke `/api/analytics/web-vitals` untuk monitoring.

### Long Task Detection

Task yang lebih dari 50ms otomatis terdeteksi dan di-log ke `/api/analytics/long-tasks`.

### Bundle Size Monitoring

Di development mode, bundle size otomatis di-monitor di console:

```
📦 Bundle Size Monitor
JavaScript: 245.32 KB
CSS: 45.67 KB
Total: 290.99 KB
```

## Best Practices

### 1. Component Optimization

#### ✅ DO:
```tsx
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething()
}, [])

// Memoize components
const MemoizedChild = memo(ChildComponent)
```

#### ❌ DON'T:
```tsx
// Don't create new objects/arrays in render
<Component data={{ name: 'test' }} /> // Creates new object every render

// Don't use inline functions in props
<Button onClick={() => handleClick()} /> // Creates new function every render
```

### 2. Data Fetching

#### ✅ DO:
```tsx
// Use React Query with proper caching
const { data } = useQuery({
  queryKey: ['recipes', userId],
  queryFn: fetchRecipes,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000 // 10 minutes
})
```

#### ❌ DON'T:
```tsx
// Don't fetch on every render
useEffect(() => {
  fetchData() // No dependencies = runs every render
})
```

### 3. Image Optimization

#### ✅ DO:
```tsx
// Use Next.js Image with proper sizing
<Image
  src="/product.jpg"
  alt="Product"
  width={300}
  height={200}
  quality={75}
  loading="lazy"
/>
```

#### ❌ DON'T:
```tsx
// Don't use regular img tags
<img src="/large-image.jpg" /> // No optimization
```

### 4. Code Splitting

#### ✅ DO:
```tsx
// Dynamic import for heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

#### ❌ DON'T:
```tsx
// Don't import everything at once
import { AllComponents } from 'heavy-library'
```

## Performance Checklist

### Before Deployment

- [ ] Run `npm run build:analyze` untuk check bundle size
- [ ] Test di slow 3G network
- [ ] Check Lighthouse score (target: > 90)
- [ ] Verify Core Web Vitals
- [ ] Test on mobile devices
- [ ] Check for memory leaks
- [ ] Optimize images (WebP format)
- [ ] Enable compression (gzip/brotli)
- [ ] Add proper caching headers
- [ ] Remove console.logs

### Regular Monitoring

- [ ] Weekly bundle size check
- [ ] Monthly Lighthouse audit
- [ ] Track Core Web Vitals trends
- [ ] Monitor API response times
- [ ] Check database query performance
- [ ] Review error logs
- [ ] Analyze user behavior

## Tools & Commands

### Build Analysis
```bash
# Analyze bundle size
npm run build:analyze

# Type check
npm run type-check

# Lint check
npm run lint
```

### Performance Testing
```bash
# Lighthouse CI
npx lighthouse https://your-app.com --view

# Bundle size
npx bundlesize

# Load testing
npx artillery quick --count 10 --num 100 https://your-app.com
```

## Common Issues & Solutions

### Issue: Large Bundle Size

**Solution:**
1. Use dynamic imports
2. Remove unused dependencies
3. Tree-shake properly
4. Use lighter alternatives

### Issue: Slow Initial Load

**Solution:**
1. Optimize images
2. Defer non-critical JS
3. Use code splitting
4. Enable compression

### Issue: Poor Mobile Performance

**Solution:**
1. Reduce JavaScript
2. Optimize images for mobile
3. Use responsive images
4. Test on real devices

### Issue: Memory Leaks

**Solution:**
1. Clean up useEffect
2. Remove event listeners
3. Cancel pending requests
4. Use WeakMap/WeakSet

## Advanced Optimizations

### 1. Service Worker

```tsx
// Register service worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

### 2. Prefetching

```tsx
// Prefetch next page on hover
<Link 
  href="/orders"
  onMouseEnter={() => prefetchRoute('/orders')}
>
  Orders
</Link>
```

### 3. Resource Hints

```html
<!-- Preconnect to external domains -->
<link rel="preconnect" href="https://api.example.com">

<!-- DNS prefetch -->
<link rel="dns-prefetch" href="https://cdn.example.com">

<!-- Preload critical resources -->
<link rel="preload" href="/fonts/main.woff2" as="font">
```

### 4. Compression

```js
// Enable compression in next.config.js
module.exports = {
  compress: true,
  // ...
}
```

## Monitoring Dashboard

Access performance metrics at:
- Development: Console logs
- Production: `/api/analytics/web-vitals`

### Metrics to Track

1. **Core Web Vitals**
   - LCP, FID, CLS, FCP, TTFB

2. **Custom Metrics**
   - API response time
   - Database query time
   - Component render time
   - Bundle size

3. **User Metrics**
   - Page load time
   - Time to interactive
   - User engagement
   - Error rate

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Bundle Analysis](https://bundlephobia.com/)

---

**Remember**: Performance is a feature, not an afterthought! 🚀

**Last Updated**: October 29, 2025
