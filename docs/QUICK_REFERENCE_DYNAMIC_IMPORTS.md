# Quick Reference: Dynamic Imports dengan Webpack Magic Comments

## ✅ Pola yang Benar

### Komponen Standar
```typescript
import dynamic from 'next/dynamic'

const MyComponent = dynamic(
  () => import(/* webpackChunkName: "my-component" */ './MyComponent'),
  {
    ssr: false,
    loading: () => <LoadingSkeleton />
  }
)
```

### Komponen dari Library (Recharts)
```typescript
const LineChart = dynamic(
  () => import(/* webpackChunkName: "recharts" */ 'recharts').then(mod => mod.LineChart),
  { ssr: false }
)
```

### Dengan Named Export
```typescript
const Component = dynamic(
  () => import(/* webpackChunkName: "feature-component" */ './components').then(mod => ({ default: mod.Component })),
  {
    loading: () => <Skeleton />
  }
)
```

## ❌ Pola yang Salah

```typescript
// ❌ Tidak ada chunk name
const Component = dynamic(() => import('./Component'))

// ❌ Tidak ada loading state
const Component = dynamic(
  () => import('./Component'),
  { ssr: false }
)

// ❌ Redundant .then() tanpa chunk name
const Component = dynamic(
  () => import('./Component').then(mod => ({ default: mod.default }))
)
```

## 📋 Konvensi Penamaan

### Format
- **kebab-case** (huruf kecil dengan dash)
- **Deskriptif** (jelaskan fungsi komponen)
- **Prefix feature** jika perlu (untuk organisasi)

### Contoh Baik
```typescript
/* webpackChunkName: "sidebar-navigation" */
/* webpackChunkName: "dashboard-stats-cards" */
/* webpackChunkName: "order-customer-step" */
/* webpackChunkName: "ai-recipe-generator" */
/* webpackChunkName: "whatsapp-template-form" */
```

### Contoh Buruk
```typescript
/* webpackChunkName: "Component1" */  // ❌ Tidak deskriptif
/* webpackChunkName: "myComponent" */  // ❌ camelCase
/* webpackChunkName: "comp" */         // ❌ Terlalu pendek
```

## 🎯 Use Cases

### 1. Heavy Components (Charts, Tables)
```typescript
const DataTable = dynamic(
  () => import(/* webpackChunkName: "data-table" */ '@/components/DataTable'),
  {
    ssr: false,
    loading: () => <TableSkeleton />
  }
)
```

### 2. Modal/Dialog Content
```typescript
const OrderDialog = dynamic(
  () => import(/* webpackChunkName: "order-dialog" */ './OrderDialog'),
  {
    ssr: false,
    loading: () => <DialogSkeleton />
  }
)
```

### 3. Mobile-Only Components
```typescript
const MobileNav = dynamic(
  () => import(/* webpackChunkName: "mobile-nav" */ './MobileNav'),
  {
    ssr: false,
    loading: () => <NavSkeleton />
  }
)
```

### 4. Feature Modules
```typescript
const AIGenerator = dynamic(
  () => import(/* webpackChunkName: "ai-generator" */ '@/modules/ai/Generator'),
  {
    ssr: false,
    loading: () => <GeneratorSkeleton />
  }
)
```

### 5. Recharts Components (Shared Chunk)
```typescript
// Semua komponen recharts gunakan chunk name yang sama
const LineChart = dynamic(
  () => import(/* webpackChunkName: "recharts" */ 'recharts').then(mod => mod.LineChart),
  { ssr: false }
)

const BarChart = dynamic(
  () => import(/* webpackChunkName: "recharts" */ 'recharts').then(mod => mod.BarChart),
  { ssr: false }
)
```

## 🔍 Debugging

### Check Chunk Loading
1. Open Chrome DevTools
2. Go to Network tab
3. Filter by "JS"
4. Look for chunk files dengan nama yang sesuai

### Verify HMR
1. Edit komponen yang di-dynamic import
2. Save file
3. Check console untuk errors
4. Verify komponen reload tanpa full page refresh

### Bundle Analysis
```bash
pnpm build:analyze
```
Look for:
- Chunk sizes (ideal <200KB)
- Duplicate code across chunks
- Unused chunks

## 🚨 Common Issues

### "Missing module factory" Error
**Cause:** Chunk name tidak stabil atau tidak ada
**Fix:** Tambahkan webpack magic comment dengan chunk name

### Chunk Not Loading (404)
**Cause:** Chunk name invalid atau path salah
**Fix:** 
- Check chunk name tidak ada special characters
- Verify import path benar
- Clear `.next` folder dan rebuild

### Slow Loading
**Cause:** Chunk terlalu besar atau tidak di-preload
**Fix:**
- Split chunk lebih kecil
- Implement preloading on hover
- Optimize component size

## 📊 Chunk Size Guidelines

- **Small:** <50KB - OK untuk lazy load
- **Medium:** 50-200KB - Ideal untuk code splitting
- **Large:** 200KB-500KB - Consider splitting further
- **Very Large:** >500KB - Must split into smaller chunks

## 🎨 Loading States

### Minimal
```typescript
loading: () => <div>Loading...</div>
```

### With Skeleton
```typescript
loading: () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
)
```

### Matching Layout
```typescript
loading: () => (
  <Card className="h-64">
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-full w-full" />
    </CardContent>
  </Card>
)
```

## 🔗 Preloading

### On Hover
```typescript
<button
  onMouseEnter={() => {
    import(/* webpackChunkName: "order-form" */ './OrderForm')
  }}
  onClick={() => setShowForm(true)}
>
  Create Order
</button>
```

### On Route Change
```typescript
useEffect(() => {
  router.prefetch('/orders')
  import(/* webpackChunkName: "order-list" */ './OrderList')
}, [router])
```

## 📝 Checklist untuk Code Review

- [ ] Ada webpack magic comment dengan chunk name
- [ ] Chunk name menggunakan kebab-case
- [ ] Chunk name deskriptif
- [ ] Ada loading state yang sesuai
- [ ] SSR setting sesuai (ssr: false untuk client-only)
- [ ] Tidak ada redundant .then() transformation
- [ ] Preloading implemented jika perlu

## 🔧 Tools

### Check All Dynamic Imports
```bash
grep -r "dynamic(" src/ --include="*.tsx" --include="*.ts"
```

### Find Missing Chunk Names
```bash
grep -r "dynamic(.*import(" src/ | grep -v "webpackChunkName"
```

### List All Chunk Names
```bash
grep -r "webpackChunkName:" src/ | sed 's/.*webpackChunkName: "\([^"]*\)".*/\1/' | sort | uniq
```

## 📚 Resources

- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Webpack Magic Comments](https://webpack.js.org/api/module-methods/#magic-comments)
- [Best Practices Doc](./DYNAMIC_IMPORT_BEST_PRACTICES.md)
- [Implementation Log](./DYNAMIC_IMPORTS_IMPLEMENTATION_LOG.md)

---

**Last Updated:** 27 Oktober 2025
**Status:** ✅ Active
