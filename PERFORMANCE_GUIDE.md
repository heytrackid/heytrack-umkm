# 🚀 Performance Optimization Guide

## ✅ Improvements Implemented

### Phase 1: Critical Fixes
- [x] Fixed swipeable tabs gesture (kanan-kiri)
- [x] Increased Node.js memory to 6GB
- [x] Added bundle analyzer script
- [x] Optimized package imports in next.config.ts

### Phase 2: Performance
- [x] Created debounced API hook
- [x] Added 23+ packages to tree-shaking optimization
- [ ] Implement SWR provider with caching
- [ ] Add dynamic imports for heavy components

## 📊 Expected Results

### Before Optimization:
- Bundle size: **~348MB** (.next folder)
- Memory usage: **4GB** (crashes)
- First Load: ~3-5s
- Lighthouse: ~60-70

### Target After Full Optimization:
- Bundle size: **~150MB** (-57%)
- Memory usage: **2GB** (-50%)
- First Load: **~1-2s** (-60%)
- Lighthouse: **85-95** (+25 points)

---

## 🛠️ How to Use

### 1. Swipeable Tabs

Lihat [SWIPEABLE_TABS_USAGE.md](./SWIPEABLE_TABS_USAGE.md) untuk full guide.

**Quick Example**:
```tsx
import { SwipeableTabsContentContainer } from '@/components/ui'

<SwipeableTabsContentContainer
  tabValues={['tab1', 'tab2', 'tab3']}
  currentValue={activeTab}
  onValueChange={setActiveTab}
>
  {/* your tab content */}
</SwipeableTabsContentContainer>
```

### 2. Debounced API Calls

**For Search/Filter**:
```tsx
import { useDebouncedValue } from '@/hooks/useDebouncedApi'

const [search, setSearch] = useState('')
const debouncedSearch = useDebouncedValue(search, 300)

useEffect(() => {
  // This only fires 300ms after user stops typing
  fetchData(debouncedSearch)
}, [debouncedSearch])
```

**For Full API Call**:
```tsx
import { useDebouncedApi } from '@/hooks/useDebouncedApi'

const { data, loading, error } = useDebouncedApi(
  async () => fetchOrders(filters),
  [filters.status, filters.date],
  { 
    delay: 300,
    onSuccess: (data) => console.log('Loaded:', data.length)
  }
)
```

### 3. Increased Memory

Development server sekarang pakai **6GB RAM** (naik dari 4GB).

Scripts yang sudah di-update:
- `pnpm dev` - Normal dev mode
- `pnpm dev:turbo` - Turbopack mode
- `pnpm dev:webpack` - Webpack mode (paling stabil)
- `pnpm dev:clean` - Clean cache + dev

### 4. Optimized Package Imports

23+ packages sekarang di-optimize untuk tree-shaking:
- All Radix UI components
- Lucide React icons
- Recharts
- Date-fns
- Lodash
- Zod
- Supabase

**Hasil**: Bundle size lebih kecil karena unused code di-strip.

---

## 📝 TODO: Next Optimizations

### High Priority

#### 1. Dynamic Imports for Heavy Components
**Target**: Chart components, PDF generators, Excel export

```tsx
// Before (loads everything)
import { BarChart } from 'recharts'

// After (loads on demand)
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), {
  loading: () => <ChartSkeleton />,
  ssr: false
})
```

**Files to update**:
- `src/app/reports/components/EnhancedProfitReport.tsx`
- `src/app/hpp/reports/page.tsx`
- `src/app/dashboard/page.tsx`
- All files using Recharts

**Impact**: -50KB initial bundle

#### 2. Implement SWR Caching

```bash
# Install SWR
pnpm add swr
```

**Create Provider**:
```tsx
// src/providers/SWRProvider.tsx
import { SWRConfig } from 'swr'

export function SWRProvider({ children }) {
  return (
    <SWRConfig
      value={{
        dedupingInterval: 5000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        errorRetryCount: 2,
        fetcher: (url) => fetch(url).then(r => r.json())
      }}
    >
      {children}
    </SWRConfig>
  )
}
```

**Impact**: -30% API calls, faster perceived loading

#### 3. Image Optimization

```tsx
// Use Next.js Image with placeholders
import Image from 'next/image'

<Image
  src="/product.jpg"
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  alt="Product"
/>
```

**Generate placeholders**:
```bash
# Add to scripts
pnpm add -D plaiceholder
```

**Impact**: Faster perceived loading, better UX

### Medium Priority

#### 4. Code Splitting per Route

Already configured in `src/components/lazy/index.ts`.

**To implement**:
```tsx
// Preload on hover
<Link 
  href="/orders" 
  onMouseEnter={() => preloadOrders()}
>
  Orders
</Link>
```

#### 5. Optimize Re-renders

**Add to components with many props**:
```tsx
// Wrap callbacks
const handleClick = useCallback(() => {
  doSomething()
}, [deps])

// Wrap expensive calculations
const filtered = useMemo(() => 
  data.filter(item => item.active), 
  [data]
)
```

**Quick scan**:
```bash
# Find components with useState + useEffect
rg "useState.*useEffect" src/app -l
```

#### 6. Font Optimization

Add to `src/app/layout.tsx`:
```tsx
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
})
```

### Low Priority

#### 7. Service Worker for Offline Support

```bash
pnpm add next-pwa
```

#### 8. Prefetch Critical API Data

```tsx
// In _app or layout
<link rel="prefetch" href="/api/stats" />
```

---

## 🔍 Monitoring Performance

### 1. Check Bundle Size

```bash
pnpm analyze

# Opens browser with bundle analyzer
```

### 2. Lighthouse Audit

```bash
# Install globally
npm i -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view
```

### 3. Memory Usage

```bash
# Monitor in real-time
watch -n 1 'ps aux | grep "next" | grep -v grep'
```

### 4. Build Size Report

```bash
pnpm build

# Check output:
# ✓ Page Size First Load JS
# ○ /                    120 kB  // Target: < 150kB
# ○ /orders             180 kB  // Target: < 200kB
```

---

## 🎯 Performance Checklist

### Development
- [ ] Use `pnpm dev:webpack` kalau sering crash
- [ ] Clear cache kalau perubahan tidak muncul: `rm -rf .next .turbo`
- [ ] Monitor memory dengan Activity Monitor
- [ ] Gunakan React DevTools Profiler untuk cek re-renders

### Before Deploy
- [ ] Run `pnpm build` untuk test production build
- [ ] Check bundle size < 200MB
- [ ] Run Lighthouse audit
- [ ] Test on real mobile device
- [ ] Check Core Web Vitals:
  - LCP < 2.5s
  - FID < 100ms  
  - CLS < 0.1

### API Performance
- [ ] Semua search inputs pakai debouncing (300ms)
- [ ] API calls pakai caching (SWR atau React Query)
- [ ] Paginate large datasets
- [ ] Add loading states untuk better UX

---

## 💡 Quick Wins

### Immediate (< 5 min)
```bash
# 1. Clear all caches
rm -rf .next .turbo node_modules/.cache

# 2. Restart with more memory
pnpm dev:clean
```

### Fast (30 min)
1. Add debouncing ke search inputs
2. Use swipeable tabs untuk better UX
3. Add loading skeletons

### High Impact (2 hours)
1. Dynamic import Recharts
2. Implement SWR caching
3. Optimize re-renders dengan useCallback/useMemo

---

## 📚 Resources

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

---

## 🐛 Common Issues

### Build crashes with "Out of Memory"
```bash
# Increase even more
NODE_OPTIONS='--max-old-space-size=8192' pnpm build
```

### Worker has exited errors
See [QUICK_FIX_WORKER_CRASH.md](./QUICK_FIX_WORKER_CRASH.md)

### Slow development server
```bash
# Use webpack (more stable)
pnpm dev:webpack

# Or clean everything
pnpm dev:clean
```

### Bundle size still huge
1. Run analyzer: `pnpm analyze`
2. Find largest chunks
3. Add dynamic imports
4. Check if unused packages can be removed

---

## 📈 Tracking Progress

| Metric | Before | Current | Target |
|--------|--------|---------|--------|
| Bundle (.next) | 348MB | ? | 150MB |
| Memory | 4GB | 6GB | 2GB |
| First Load | 3-5s | ? | 1-2s |
| Lighthouse | 60-70 | ? | 85-95 |

Update this table as you implement optimizations! 🚀
