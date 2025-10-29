# Pagination Implementation Guide

Sistem pagination lengkap untuk HeyTrack dengan komponen UI, hooks, dan validasi.

## 📦 Komponen yang Dibuat

### 1. UI Components
- `src/components/ui/pagination.tsx` - Komponen pagination UI yang responsive

### 2. Hooks
- `src/hooks/usePagination.ts` - Hook untuk state management pagination
- `src/hooks/usePagination.ts` - Hook `useClientPagination` untuk client-side pagination

### 3. Validations
- `src/lib/validations/pagination.ts` - Schema validasi dan helper functions

### 4. Example Components
- `src/components/orders/OrdersListWithPagination.tsx` - Contoh implementasi lengkap

## 🎯 Fitur

### Pagination Component
- ✅ Responsive (mobile & desktop)
- ✅ Page size selector
- ✅ First/Last page navigation
- ✅ Previous/Next navigation
- ✅ Page numbers dengan ellipsis
- ✅ Info jumlah data
- ✅ Customizable page size options
- ✅ Bahasa Indonesia

### usePagination Hook
- ✅ State management untuk page & pageSize
- ✅ Calculated values (totalPages, startIndex, endIndex)
- ✅ Navigation functions (nextPage, previousPage, firstPage, lastPage)
- ✅ Helper untuk API calls (paginationParams)
- ✅ Memoized untuk performance

### Validation
- ✅ Zod schema untuk query parameters
- ✅ Helper untuk create pagination metadata
- ✅ Type-safe pagination response

## 📖 Cara Penggunaan

### 1. Server-Side Pagination (Recommended)

#### API Route
```typescript
import { createPaginationMeta, PaginationQuerySchema } from '@/lib/validations/pagination'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Validate pagination params
  const validation = PaginationQuerySchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  })
  
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }
  
  const { page, limit } = validation.data
  
  // Get total count
  const { count } = await supabase
    .from('table')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
  
  // Get paginated data
  const offset = (page - 1) * limit
  const { data } = await supabase
    .from('table')
    .select('*')
    .eq('user_id', user.id)
    .range(offset, offset + limit - 1)
  
  // Return with metadata
  return NextResponse.json({
    data,
    meta: createPaginationMeta(page, limit, count || 0)
  })
}
```

#### Client Component
```typescript
'use client'

import { useState, useEffect } from 'react'
import { usePagination } from '@/hooks/usePagination'
import { Pagination } from '@/components/ui/pagination'
import type { PaginatedResponse } from '@/lib/validations/pagination'

export function MyList() {
  const [data, setData] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  
  const pagination = usePagination({
    initialPageSize: 10,
    totalItems,
  })
  
  const fetchData = async () => {
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.pageSize.toString(),
    })
    
    const response = await fetch(`/api/items?${params}`)
    const result: PaginatedResponse<Item> = await response.json()
    
    setData(result.data)
    setTotalItems(result.meta.total)
  }
  
  useEffect(() => {
    fetchData()
  }, [pagination.page, pagination.pageSize])
  
  return (
    <div>
      {/* Your list */}
      {data.map(item => <div key={item.id}>{item.name}</div>)}
      
      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={totalItems}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  )
}
```

### 2. Client-Side Pagination

Untuk data yang sudah di-load semua di client:

```typescript
'use client'

import { useClientPagination } from '@/hooks/usePagination'
import { Pagination } from '@/components/ui/pagination'

export function MyList({ items }: { items: Item[] }) {
  const {
    data: paginatedData,
    page,
    pageSize,
    totalPages,
    setPage,
    setPageSize,
  } = useClientPagination(items, {
    initialPageSize: 12,
  })
  
  return (
    <div>
      {/* Your list */}
      {paginatedData.map(item => <div key={item.id}>{item.name}</div>)}
      
      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={items.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  )
}
```

## 🎨 Customization

### Page Size Options
```typescript
<Pagination
  // ... other props
  pageSizeOptions={[10, 20, 50, 100]}
/>
```

### Hide Page Size Selector
```typescript
<Pagination
  // ... other props
  showPageSizeSelector={false}
/>
```

### Hide Page Info
```typescript
<Pagination
  // ... other props
  showPageInfo={false}
/>
```

### Custom Styling
```typescript
<Pagination
  // ... other props
  className="my-custom-class"
/>
```

## 📱 Mobile Responsive

Komponen pagination otomatis menyesuaikan tampilan:

**Desktop:**
- Menampilkan page numbers dengan ellipsis
- Full controls visible

**Mobile:**
- Page numbers diganti dengan "X / Y"
- Compact layout
- Touch-friendly buttons

## ✅ Implementasi yang Sudah Selesai

### API Routes
- ✅ `/api/recipes` - Server-side pagination dengan metadata
- ✅ `/api/orders` - Server-side pagination dengan metadata

### Pages
- ✅ `/recipes` - Client-side pagination (EnhancedRecipesPage)
- ✅ `/orders` - Example component (OrdersListWithPagination)

## 🚀 Next Steps

### Implementasi ke Halaman Lain

1. **Ingredients Page**
```bash
# Update API route
src/app/api/ingredients/route.ts

# Update page component
src/app/ingredients/page.tsx
```

2. **Customers Page**
```bash
# Update API route
src/app/api/customers/route.ts

# Update page component
src/app/customers/page.tsx
```

3. **Financial Records Page**
```bash
# Update API route
src/app/api/financial-records/route.ts

# Update page component
src/app/financial-records/page.tsx
```

### Pattern untuk Update API Route

```typescript
// 1. Import helper
import { createPaginationMeta, PaginationQuerySchema } from '@/lib/validations/pagination'

// 2. Get count
const { count } = await supabase
  .from('table')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)

// 3. Get paginated data
const offset = (page - 1) * limit
const { data } = await supabase
  .from('table')
  .select('*')
  .eq('user_id', user.id)
  .range(offset, offset + limit - 1)

// 4. Return with metadata
return NextResponse.json({
  data,
  meta: createPaginationMeta(page, limit, count || 0)
})
```

### Pattern untuk Update Page Component

```typescript
// 1. Import hooks
import { usePagination } from '@/hooks/usePagination'
import { Pagination } from '@/components/ui/pagination'

// 2. Setup state
const [totalItems, setTotalItems] = useState(0)
const pagination = usePagination({
  initialPageSize: 10,
  totalItems,
})

// 3. Fetch with pagination
const fetchData = async () => {
  const params = new URLSearchParams({
    page: pagination.page.toString(),
    limit: pagination.pageSize.toString(),
  })
  const response = await fetch(`/api/items?${params}`)
  const result = await response.json()
  setData(result.data)
  setTotalItems(result.meta.total)
}

// 4. Add pagination component
<Pagination
  currentPage={pagination.page}
  totalPages={pagination.totalPages}
  totalItems={totalItems}
  pageSize={pagination.pageSize}
  onPageChange={pagination.setPage}
  onPageSizeChange={pagination.setPageSize}
/>
```

## 🧪 Testing

### Test Checklist
- [ ] Page navigation works (1, 2, 3, ...)
- [ ] First/Last page buttons work
- [ ] Previous/Next buttons work
- [ ] Page size selector works
- [ ] Data updates correctly on page change
- [ ] URL params sync (optional)
- [ ] Mobile responsive
- [ ] Loading states
- [ ] Empty states
- [ ] Error handling

### Manual Testing
```bash
# Start dev server
pnpm dev

# Test pages:
# - http://localhost:3000/recipes
# - http://localhost:3000/orders

# Test scenarios:
# 1. Navigate between pages
# 2. Change page size
# 3. Search/filter with pagination
# 4. Mobile view (resize browser)
```

## 📚 Type Definitions

```typescript
// Pagination state
interface PaginationState {
  page: number
  pageSize: number
}

// Pagination metadata
interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

// Paginated response
interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// Hook return type
interface UsePaginationReturn {
  page: number
  pageSize: number
  totalPages: number
  startIndex: number
  endIndex: number
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  nextPage: () => void
  previousPage: () => void
  firstPage: () => void
  lastPage: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  paginationParams: {
    page: number
    limit: number
    offset: number
  }
}
```

## 🎯 Best Practices

1. **Always validate pagination params** di API routes
2. **Return metadata** untuk client-side pagination controls
3. **Reset to page 1** saat filter/search berubah
4. **Use memoization** untuk calculated values
5. **Handle empty states** dengan baik
6. **Show loading states** saat fetching
7. **Mobile-first design** untuk pagination controls
8. **Consistent page sizes** across app (10, 20, 50, 100)

## 🐛 Troubleshooting

### Pagination tidak update
- Pastikan `totalItems` state di-update setelah fetch
- Check `useEffect` dependencies

### Page numbers tidak muncul
- Pastikan `totalPages` > 1
- Check `totalItems` value

### Data tidak berubah saat ganti page
- Pastikan `page` ada di `useEffect` dependencies
- Check API call menggunakan `pagination.page`

### Mobile view broken
- Check responsive classes di component
- Test di real device, bukan hanya browser resize

---

**Status:** ✅ Implemented  
**Last Updated:** October 29, 2025  
**Version:** 1.0.0
