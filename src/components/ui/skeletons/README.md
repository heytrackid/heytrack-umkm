# 💀 Skeleton Loading System - HeyTrack

Sistem loading skeleton yang lengkap dan mudah digunakan untuk meningkatkan UX aplikasi HeyTrack.

## 🎯 Tujuan

- **Meningkatkan User Experience** dengan memberikan feedback visual saat loading
- **Konsistensi Desain** dengan skeleton yang seragam di seluruh aplikasi  
- **Performance Optimization** dengan lazy loading yang terstruktur
- **Accessibility** dengan proper loading states untuk screen readers

## 📁 Struktur File

```
src/components/ui/skeletons/
├── README.md                    # Dokumentasi ini
├── dashboard-skeletons.tsx      # Skeleton untuk dashboard components
├── table-skeletons.tsx          # Skeleton untuk table dan list components  
└── form-skeletons.tsx          # Skeleton untuk form components
```

## 🧱 Komponen Skeleton Dasar

### 1. Skeleton Utilities (dari `skeleton.tsx`)

```tsx
import { 
  Skeleton,           // Basic skeleton
  SkeletonText,       // Text dengan multiple lines
  SkeletonAvatar,     // Avatar/profile picture
  SkeletonButton,     // Button placeholder
  SkeletonCard,       // Card dengan header dan content
  SkeletonTable,      // Table dengan rows dan columns
  SkeletonChart,      // Chart/graph placeholder
  SkeletonForm        // Form dengan fields
} from '@/components/ui/skeleton'

// Contoh penggunaan:
<Skeleton className="h-4 w-48" />
<SkeletonText lines={3} />
<SkeletonAvatar className="h-12 w-12" />
```

## 🏠 Dashboard Skeletons

### Komponen Available:

```tsx
import {
  StatsCardSkeleton,        // Stats card di dashboard
  DashboardHeaderSkeleton,  // Header dengan title dan actions
  RecentOrdersSkeleton,     // List pesanan terbaru
  StockAlertSkeleton,       // Stock alert dengan progress bars
  QuickActionsSkeleton,     // Quick action buttons
  HPPResultsSkeleton,       // HPP calculation results
  ChartCardSkeleton         // Chart dengan legend
} from '@/components/ui/skeletons/dashboard-skeletons'
```

### Contoh Penggunaan di Dashboard:

```tsx
export default function Dashboard() {
  const { loading, isLoading } = useLoading({
    [LOADING_KEYS.DASHBOARD_STATS]: true
  })

  return (
    <div>
      {isLoading(LOADING_KEYS.DASHBOARD_STATS) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        // Real content here
      )}
    </div>
  )
}
```

## 📊 Table Skeletons

### Komponen Available:

```tsx
import {
  OrdersTableSkeleton,      // Table untuk orders
  CustomersTableSkeleton,   // Table untuk customers
  InventoryTableSkeleton,   // Table untuk inventory
  RecipesTableSkeleton,     // Table untuk recipes
  ListViewSkeleton,         // Mobile-friendly list view
  DataGridSkeleton,         // Table dengan search dan pagination
  SearchFormSkeleton        // Search dan filter form
} from '@/components/ui/skeletons/table-skeletons'
```

### Contoh Penggunaan di Orders Page:

```tsx
export default function OrdersPage() {
  const { isLoading } = useLoading({ 
    [LOADING_KEYS.FETCH_ORDERS]: true 
  })

  return (
    <div>
      {/* Search Form */}
      {isLoading(LOADING_KEYS.FETCH_ORDERS) ? (
        <SearchFormSkeleton />
      ) : (
        <SearchForm />
      )}

      {/* Data Table */}
      {isLoading(LOADING_KEYS.FETCH_ORDERS) ? (
        <OrdersTableSkeleton rows={5} />
      ) : (
        <OrdersTable data={orders} />
      )}
    </div>
  )
}
```

## 📝 Form Skeletons

### Komponen Available:

```tsx
import {
  FormFieldSkeleton,        // Single form field
  TextareaFieldSkeleton,    // Textarea field
  SelectFieldSkeleton,      // Select dropdown field
  RecipeFormSkeleton,       // Complete recipe form
  OrderFormSkeleton,        // Complete order form
  SettingsFormSkeleton,     // Settings form
  AuthFormSkeleton,         // Login/register form
  ModalFormSkeleton,        // Form dalam modal
  SearchFormSkeleton        // Search dan filter form
} from '@/components/ui/skeletons/form-skeletons'
```

### Contoh Penggunaan di Form:

```tsx
export default function RecipeForm() {
  const { isLoading } = useLoading({ 
    [LOADING_KEYS.CALCULATE_HPP]: false 
  })

  return (
    <div>
      {isLoading(LOADING_KEYS.CALCULATE_HPP) ? (
        <RecipeFormSkeleton />
      ) : (
        <RecipeFormComponent />
      )}
    </div>
  )
}
```

## 🎣 useLoading Hook

### Penggunaan Hook:

```tsx
import { useLoading, LOADING_KEYS } from '@/hooks/useLoading'

// Multiple loading states
const { loading, isLoading, setLoading, withLoading } = useLoading({
  [LOADING_KEYS.FETCH_ORDERS]: false,
  [LOADING_KEYS.FETCH_CUSTOMERS]: false
})

// Check individual loading state
if (isLoading(LOADING_KEYS.FETCH_ORDERS)) {
  // Show skeleton
}

// Set loading state manually
setLoading(LOADING_KEYS.FETCH_ORDERS, true)

// Wrap async operation with loading
await withLoading(LOADING_KEYS.FETCH_ORDERS, async () => {
  return await fetchOrders()
})
```

### Hook Variants:

```tsx
// Simple loading untuk single state
const [isLoading, setIsLoading, withLoading] = useSimpleLoading()

// Loading dengan minimum duration 
const { isLoading, withLoading } = useMinimumLoading(500) // 500ms minimum
```

## 🎨 Customization

### Custom Skeleton:

```tsx
// Custom skeleton dengan styling khusus
<Skeleton className="h-6 w-32 bg-blue-200 dark:bg-blue-800" />

// Skeleton dengan animation khusus
<div className="animate-pulse">
  <Skeleton className="h-4 w-full mb-2" />
  <Skeleton className="h-4 w-3/4" />
</div>
```

### Custom Skeleton Component:

```tsx
function CustomProductSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <Skeleton className="h-32 w-full" /> {/* Product image */}
      <SkeletonText className="h-5 w-3/4" /> {/* Product name */}
      <SkeletonText className="h-4 w-1/2" /> {/* Price */}
      <div className="flex space-x-2">
        <SkeletonButton className="flex-1" />
        <SkeletonButton className="w-10" />
      </div>
    </div>
  )
}
```

## 🚀 Performance Tips

### 1. Lazy Loading dengan Skeleton:

```tsx
const LazyComponent = lazy(() => import('./HeavyComponent'))

function Page() {
  return (
    <Suspense fallback={<CustomSkeleton />}>
      <LazyComponent />
    </Suspense>
  )
}
```

### 2. Minimum Loading Duration:

```tsx
// Pastikan skeleton tampil minimal 500ms untuk UX yang smooth
const { withLoading } = useMinimumLoading(500)

useEffect(() => {
  withLoading(async () => {
    const data = await fetchData() // Bahkan jika cepat, skeleton tetap tampil 500ms
    setData(data)
  })
}, [])
```

### 3. Progressive Loading:

```tsx
// Load berbagai bagian secara bertahap
const { loading, setLoading } = useLoading({
  [LOADING_KEYS.DASHBOARD_STATS]: true,
  [LOADING_KEYS.RECENT_ORDERS]: true,
  [LOADING_KEYS.STOCK_ALERTS]: true
})

// Stats selesai dulu (1.5s)
setTimeout(() => setLoading(LOADING_KEYS.DASHBOARD_STATS, false), 1500)
// Orders selesai (2s)  
setTimeout(() => setLoading(LOADING_KEYS.RECENT_ORDERS, false), 2000)
// Stock alerts terakhir (1.8s)
setTimeout(() => setLoading(LOADING_KEYS.STOCK_ALERTS, false), 1800)
```

## 🎯 Best Practices

### 1. Konsistensi Ukuran:

```tsx
// ❌ Tidak konsisten
<Skeleton className="h-6 w-32" />
<Skeleton className="h-4 w-48" />

// ✅ Konsisten dengan design system
<SkeletonText className="h-4 w-full" />
<SkeletonText className="h-4 w-3/4" />
```

### 2. Match Content Structure:

```tsx
// ✅ Skeleton yang meniru struktur real content
{isLoading ? (
  <div className="space-y-4">
    <div className="flex items-center space-x-3">
      <SkeletonAvatar />
      <div className="space-y-1">
        <SkeletonText className="h-4 w-32" />
        <SkeletonText className="h-3 w-24" />
      </div>
    </div>
  </div>
) : (
  <UserProfile user={user} />
)}
```

### 3. Loading Keys Management:

```tsx
// ✅ Gunakan konstanta untuk loading keys
export const LOADING_KEYS = {
  FETCH_ORDERS: 'fetch_orders',
  SAVE_RECIPE: 'save_recipe',
  // ...
} as const

// ✅ TypeScript support
export type LoadingKey = typeof LOADING_KEYS[keyof typeof LOADING_KEYS]
```

## 🧪 Testing

### Test Skeleton Display:

```tsx
// Test apakah skeleton muncul saat loading
test('shows skeleton when loading', () => {
  const { getByTestId } = render(<Dashboard isLoading={true} />)
  expect(getByTestId('stats-skeleton')).toBeInTheDocument()
})

// Test transisi dari skeleton ke content
test('transitions from skeleton to content', async () => {
  const { getByTestId, queryByTestId } = render(<Dashboard />)
  
  // Initially shows skeleton
  expect(getByTestId('stats-skeleton')).toBeInTheDocument()
  
  // Wait for loading to finish
  await waitFor(() => {
    expect(queryByTestId('stats-skeleton')).not.toBeInTheDocument()
    expect(getByTestId('stats-content')).toBeInTheDocument()
  })
})
```

## 📱 Mobile Responsiveness

Semua skeleton sudah responsive dan mengikuti breakpoint Tailwind:

```tsx
// Otomatis responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {Array.from({ length: 4 }, (_, i) => (
    <StatsCardSkeleton key={i} />
  ))}
</div>
```

## 🎨 Dark Mode Support

Semua skeleton mendukung dark mode secara otomatis:

```tsx
// Otomatis sesuai tema
className="bg-gray-200 dark:bg-gray-800"
```

---

**Happy Coding! 🚀**

Untuk pertanyaan atau custom skeleton, silakan update komponen di folder `skeletons/` atau diskusi dengan tim development.