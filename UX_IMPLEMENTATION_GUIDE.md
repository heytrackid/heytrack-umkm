# UX Implementation Guide - HeyTrack

## 🎯 Tujuan: User Experience yang Maksimal

User harus:
- ✅ **Tidak bingung** - Tahu apa yang harus dilakukan
- ✅ **Tidak stuck** - Selalu ada next action
- ✅ **Tidak frustasi** - Error message yang helpful
- ✅ **Cepat produktif** - Onboarding yang smooth

---

## 📦 Komponen yang Sudah Dibuat

### 1. OrderStatusBadge - Status yang Jelas + Next Action
**File:** `src/components/orders/OrderStatusBadge.tsx`

**Kapan Pakai:**
- Di order list
- Di order detail
- Di dashboard (recent orders)

**Cara Pakai:**

```tsx
import { OrderStatusBadge, OrderProgress } from '@/components/orders/OrderStatusBadge'

// Simple badge
<OrderStatusBadge status="pending" compact />

// Badge dengan next action button
<OrderStatusBadge 
  status="pending"
  showNextAction
  onNextAction={() => confirmOrder()}
/>

// Progress indicator
<OrderProgress currentStatus="in_production" />
```

**Implementasi di Order List:**
```tsx
// src/app/orders/page.tsx atau components/OrderList.tsx
{orders.map(order => (
  <Card key={order.id}>
    <CardHeader>
      <div className="flex items-center justify-between">
        <h3>{order.order_no}</h3>
        <OrderStatusBadge 
          status={order.status}
          compact
        />
      </div>
    </CardHeader>
    <CardContent>
      <OrderProgress currentStatus={order.status} />
      
      {/* Next action button */}
      <OrderStatusBadge 
        status={order.status}
        showNextAction
        onNextAction={() => handleStatusChange(order)}
      />
    </CardContent>
  </Card>
))}
```

---

### 2. EmptyState - Guidance untuk User Baru
**File:** `src/components/ui/empty-state.tsx`

**Kapan Pakai:**
- Saat list kosong (orders, recipes, ingredients, dll)
- Saat search tidak ada hasil
- Saat filter terlalu ketat

**Cara Pakai:**

```tsx
import { EmptyState, EmptyStatePresets } from '@/components/ui/empty-state'
import { Plus, BookOpen } from 'lucide-react'

// Pakai preset (recommended)
<EmptyState
  {...EmptyStatePresets.orders}
  actions={[
    {
      label: 'Buat Order Baru',
      href: '/orders/new',
      icon: Plus
    },
    {
      label: 'Lihat Tutorial',
      href: '/help/orders',
      variant: 'outline',
      icon: BookOpen
    }
  ]}
/>

// Custom empty state
<EmptyState
  emoji="🔍"
  title="Tidak Ada Hasil"
  description="Coba gunakan kata kunci yang berbeda"
  actions={[
    {
      label: 'Reset Filter',
      onClick: () => resetFilters()
    }
  ]}
  compact
/>
```

**Implementasi di Semua List Pages:**

```tsx
// Pattern untuk semua list pages
function OrdersPage() {
  const { data: orders, isLoading } = useOrders()
  
  if (isLoading) return <LoadingSkeleton />
  
  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        {...EmptyStatePresets.orders}
        actions={[
          {
            label: 'Buat Order Pertama',
            href: '/orders/new',
            icon: Plus
          }
        ]}
      />
    )
  }
  
  return <OrderList orders={orders} />
}
```

**Preset yang Tersedia:**
- `EmptyStatePresets.orders` - Untuk halaman orders
- `EmptyStatePresets.recipes` - Untuk halaman recipes
- `EmptyStatePresets.ingredients` - Untuk halaman ingredients
- `EmptyStatePresets.customers` - Untuk halaman customers
- `EmptyStatePresets.production` - Untuk halaman production
- `EmptyStatePresets.reports` - Untuk halaman reports
- `EmptyStatePresets.hpp` - Untuk halaman HPP
- `EmptyStatePresets.search` - Untuk hasil search kosong

---

### 3. Improved Sidebar - Navigation yang Terorganisir
**File:** `src/components/layout/sidebar.tsx` (sudah di-update)

**Fitur Baru:**
- ✅ Grouping by workflow (Operasional, Keuangan, Analisis, dll)
- ✅ Collapsible sections (bisa expand/collapse)
- ✅ Visual hierarchy yang jelas
- ✅ Active state yang prominent

**Sudah Auto-Applied** - Tidak perlu implementasi tambahan!

**Struktur Baru:**
```
📊 Dashboard
  └─ Dashboard

📦 Operasional Harian (collapsible)
  ├─ Pesanan
  ├─ Produksi
  └─ Bahan Baku

💰 Keuangan (collapsible)
  ├─ Cash Flow
  ├─ Laporan Profit
  └─ Biaya Operasional

🧮 Analisis HPP (collapsible)
  ├─ HPP Dashboard
  └─ Laporan

📋 Data Master (collapsible, default collapsed)
  ├─ Resep Produk
  ├─ Pelanggan
  └─ Kategori

🤖 AI Assistant (collapsible, default collapsed)
  ├─ AI Chatbot
  └─ Generator Resep

⚙️ Pengaturan
  └─ Pengaturan
```

---

### 4. ErrorMessage - Error Handling yang User-Friendly
**File:** `src/components/ui/error-message.tsx`

**Kapan Pakai:**
- Saat API call gagal
- Saat form validation error
- Saat network error
- Saat data tidak ditemukan

**Cara Pakai:**

```tsx
import { ErrorMessage, useErrorHandler } from '@/components/ui/error-message'

// Inline error (untuk forms)
<ErrorMessage
  variant="inline"
  title="Gagal Menyimpan"
  message="Periksa kembali data yang Anda masukkan"
  onRetry={() => handleSubmit()}
/>

// Card error (untuk sections)
<ErrorMessage
  variant="card"
  error={error}
  onRetry={() => refetch()}
  onGoBack={() => router.back()}
/>

// Page error (untuk full page)
<ErrorMessage
  variant="page"
  error={error}
  onRetry={() => refetch()}
  showTechnicalDetails={isDev}
/>

// Dengan hook
function MyComponent() {
  const { error, handleError, clearError } = useErrorHandler()
  
  const fetchData = async () => {
    try {
      const data = await api.getData()
    } catch (err) {
      handleError(err) // Auto convert ke user-friendly message
    }
  }
  
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={() => {
          clearError()
          fetchData()
        }}
      />
    )
  }
  
  return <YourContent />
}
```

**Auto Error Detection:**
Component ini otomatis detect jenis error dan kasih message yang sesuai:

- Network error → "Koneksi Internet Bermasalah"
- 401/Auth error → "Sesi Anda Berakhir"
- 500/Server error → "Server Sedang Bermasalah"
- Validation error → "Data Tidak Valid"
- 404/Not found → "Data Tidak Ditemukan"

---

## 🚀 Quick Implementation Checklist

### Phase 1: Orders (Highest Impact) ⭐⭐⭐⭐⭐

**File:** `src/app/orders/page.tsx` atau `src/components/orders/OrderList.tsx`

```tsx
// 1. Add empty state
if (orders.length === 0) {
  return (
    <EmptyState
      {...EmptyStatePresets.orders}
      actions={[
        { label: 'Buat Order Baru', href: '/orders/new', icon: Plus }
      ]}
    />
  )
}

// 2. Add status badges di list
{orders.map(order => (
  <Card>
    <OrderStatusBadge status={order.status} compact />
    <OrderProgress currentStatus={order.status} />
  </Card>
))}

// 3. Add next action di detail
<OrderStatusBadge 
  status={order.status}
  showNextAction
  onNextAction={handleNextAction}
/>

// 4. Add error handling
const { error, handleError } = useErrorHandler()

if (error) {
  return <ErrorMessage error={error} onRetry={refetch} />
}
```

**Estimated Time:** 30 minutes  
**Impact:** ⭐⭐⭐⭐⭐ (Highest)

---

### Phase 2: Recipes ⭐⭐⭐⭐

**File:** `src/app/recipes/page.tsx`

```tsx
// 1. Add empty state
if (recipes.length === 0) {
  return (
    <EmptyState
      {...EmptyStatePresets.recipes}
      actions={[
        { label: 'Buat Resep Baru', href: '/recipes/new', icon: Plus },
        { label: 'Gunakan AI Generator', href: '/recipes/ai-generator', icon: Wand2 }
      ]}
    />
  )
}

// 2. Add error handling
if (error) {
  return <ErrorMessage error={error} onRetry={refetch} />
}
```

**Estimated Time:** 15 minutes  
**Impact:** ⭐⭐⭐⭐

---

### Phase 3: Ingredients ⭐⭐⭐⭐

**File:** `src/app/ingredients/page.tsx`

```tsx
if (ingredients.length === 0) {
  return (
    <EmptyState
      {...EmptyStatePresets.ingredients}
      actions={[
        { label: 'Tambah Bahan Baru', href: '/ingredients/new', icon: Plus }
      ]}
    />
  )
}
```

**Estimated Time:** 15 minutes  
**Impact:** ⭐⭐⭐⭐

---

### Phase 4: Customers ⭐⭐⭐

**File:** `src/app/customers/page.tsx`

```tsx
if (customers.length === 0) {
  return (
    <EmptyState
      {...EmptyStatePresets.customers}
      actions={[
        { label: 'Tambah Customer', onClick: openAddDialog, icon: Plus }
      ]}
    />
  )
}
```

**Estimated Time:** 15 minutes  
**Impact:** ⭐⭐⭐

---

### Phase 5: Production ⭐⭐⭐

**File:** `src/app/production/page.tsx`

```tsx
if (batches.length === 0) {
  return (
    <EmptyState
      {...EmptyStatePresets.production}
      actions={[
        { label: 'Mulai Produksi', href: '/production/new', icon: Plus }
      ]}
    />
  )
}
```

**Estimated Time:** 15 minutes  
**Impact:** ⭐⭐⭐

---

### Phase 6: Reports & HPP ⭐⭐⭐

**File:** `src/app/reports/page.tsx`, `src/app/hpp/page.tsx`

```tsx
if (!hasData) {
  return (
    <EmptyState
      {...EmptyStatePresets.reports}
      actions={[
        { label: 'Buat Order Pertama', href: '/orders/new', icon: Plus }
      ]}
    />
  )
}
```

**Estimated Time:** 20 minutes  
**Impact:** ⭐⭐⭐

---

### Phase 7: Search Results ⭐⭐

**File:** Semua halaman dengan search

```tsx
if (searchResults.length === 0 && searchQuery) {
  return (
    <EmptyState
      {...EmptyStatePresets.search}
      actions={[
        { label: 'Reset Pencarian', onClick: clearSearch }
      ]}
      compact
    />
  )
}
```

**Estimated Time:** 10 minutes per page  
**Impact:** ⭐⭐

---

## 📊 Total Implementation Time

| Phase | Time | Impact | Priority |
|-------|------|--------|----------|
| Orders | 30 min | ⭐⭐⭐⭐⭐ | 1 |
| Recipes | 15 min | ⭐⭐⭐⭐ | 2 |
| Ingredients | 15 min | ⭐⭐⭐⭐ | 3 |
| Customers | 15 min | ⭐⭐⭐ | 4 |
| Production | 15 min | ⭐⭐⭐ | 5 |
| Reports/HPP | 20 min | ⭐⭐⭐ | 6 |
| Search | 30 min | ⭐⭐ | 7 |
| **TOTAL** | **2.5 hours** | | |

---

## 🎨 Design Principles

### 1. **Clarity over Complexity**
```tsx
// ❌ Bad - Terlalu banyak info
<Badge>Status: Pending Confirmation (Waiting for Admin Approval)</Badge>

// ✅ Good - Simple & clear
<OrderStatusBadge status="pending" />
// Shows: "⏰ Menunggu Konfirmasi" + "Konfirmasi Order" button
```

### 2. **Guide, Don't Assume**
```tsx
// ❌ Bad - User bingung
<div>No orders found</div>

// ✅ Good - User tahu apa yang harus dilakukan
<EmptyState
  title="Belum Ada Order"
  description="Mulai dengan membuat order pertama"
  actions={[{ label: 'Buat Order', href: '/orders/new' }]}
  tips={[
    { icon: '💡', text: 'Order akan otomatis mengurangi stok' }
  ]}
/>
```

### 3. **Visual Hierarchy**
```tsx
// ✅ Good - Jelas mana yang penting
<Card>
  {/* Primary action - prominent */}
  <Button size="lg" variant="default">Konfirmasi Order</Button>
  
  {/* Secondary action - subtle */}
  <Button size="sm" variant="outline">Edit</Button>
  
  {/* Tertiary action - ghost */}
  <Button size="sm" variant="ghost">Cancel</Button>
</Card>
```

### 4. **Progressive Disclosure**
```tsx
// ✅ Good - Show details only when needed
<Collapsible>
  <CollapsibleTrigger>
    Lihat Detail Teknis
  </CollapsibleTrigger>
  <CollapsibleContent>
    <pre>{technicalError}</pre>
  </CollapsibleContent>
</Collapsible>
```

---

## 🔥 Pro Tips

### 1. Consistent Error Handling Pattern
```tsx
// Create a wrapper hook
function useApiCall<T>(apiFunc: () => Promise<T>) {
  const { error, handleError, clearError } = useErrorHandler()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  
  const execute = async () => {
    try {
      setLoading(true)
      clearError()
      const result = await apiFunc()
      setData(result)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }
  
  return { data, loading, error, execute }
}

// Use everywhere
const { data, loading, error, execute } = useApiCall(() => 
  fetch('/api/orders').then(r => r.json())
)

if (error) return <ErrorMessage error={error} onRetry={execute} />
```

### 2. Loading States
```tsx
// Always show loading state
if (loading) return <LoadingSkeleton />
if (error) return <ErrorMessage error={error} />
if (!data || data.length === 0) return <EmptyState {...preset} />
return <DataList data={data} />
```

### 3. Optimistic Updates
```tsx
// Show success immediately, rollback on error
const handleConfirm = async (order) => {
  // Optimistic update
  setOrders(prev => prev.map(o => 
    o.id === order.id ? { ...o, status: 'confirmed' } : o
  ))
  
  try {
    await api.confirmOrder(order.id)
    toast.success('Order dikonfirmasi')
  } catch (err) {
    // Rollback
    setOrders(prev => prev.map(o => 
      o.id === order.id ? { ...o, status: 'pending' } : o
    ))
    handleError(err)
  }
}
```

---

## 📱 Mobile Optimization

### Touch Targets
```tsx
// ✅ Minimum 44x44px for touch
<Button className="min-h-[44px] min-w-[44px]">
  Confirm
</Button>
```

### Bottom Sheets for Forms
```tsx
// Mobile: Use bottom sheet
// Desktop: Use modal
{isMobile ? (
  <BottomSheet>
    <OrderForm />
  </BottomSheet>
) : (
  <Dialog>
    <OrderForm />
  </Dialog>
)}
```

---

## ✅ Testing Checklist

Setelah implement, test:

- [ ] Empty state muncul saat data kosong
- [ ] Empty state punya action button yang work
- [ ] Status badge show correct status
- [ ] Next action button muncul dan functional
- [ ] Progress indicator show correct step
- [ ] Error message user-friendly (bukan technical)
- [ ] Retry button works
- [ ] Navigation grouping makes sense
- [ ] Collapsible sections work
- [ ] Mobile responsive (test di 375px width)

---

## 🎯 Success Metrics

Track these untuk measure improvement:

1. **Time to First Action** - Berapa lama user dari landing sampai action pertama
2. **Error Recovery Rate** - Berapa % user yang retry setelah error
3. **Feature Discovery** - Berapa % user yang explore fitur baru
4. **Task Completion Rate** - Berapa % user yang complete workflow
5. **User Satisfaction** - Survey atau feedback

---

## 🚀 Next Level UX (Future)

Setelah basic UX solid, bisa add:

1. **Onboarding Tour** - Guide user pertama kali
2. **Keyboard Shortcuts** - Power user features
3. **Bulk Actions** - Select multiple items
4. **Undo/Redo** - Mistake recovery
5. **Smart Suggestions** - AI-powered recommendations
6. **Contextual Help** - Inline tooltips & hints
7. **Personalization** - Remember user preferences

---

**Remember:** Good UX = Happy Users = Successful Business! 🎉
