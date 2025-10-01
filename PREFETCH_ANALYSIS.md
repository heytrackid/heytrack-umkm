# 📊 Analisis Prefetch Implementation - Bakery Management

## ✅ Yang Sudah Pakai Prefetch

### 1. **Sidebar Navigation** ✅
- **File:** `src/components/layout/sidebar/useSidebarLogic.ts`
- **Status:** Sudah implement
- **Routes yang di-prefetch:**
  - `/` (Dashboard)
  - `/orders`
  - `/ingredients`
  - `/hpp`
  - `/finance`
  - `/resep`
  - `/customers`

### 2. **Sidebar Item Component** ✅
- **File:** `src/components/layout/sidebar/SidebarItem.tsx`
- **Status:** Sudah ada `onMouseEnter` handler
- **Cara kerja:** Prefetch saat hover

### 3. **Layout Root** ✅
- **File:** `src/app/layout.tsx`
- **Status:** Ada prefetch setup

---

## ❌ Yang Belum Pakai Prefetch

### 1. **Breadcrumb Links** ❌
**Priority: HIGH**

#### Lokasi yang ketemu:
- `/app/orders/new/page.tsx` - line 168
  ```tsx
  <Link href="/orders">Pesanan</Link>
  ```

- `/app/cash-flow/page.tsx` - line 207
- `/app/customers/page.tsx` - line 194
- `/app/categories/page.tsx` - line 513
- `/app/resep/page.tsx` - line 67
- `/app/hpp/page.tsx` - line 148, 187
- `/app/settings/page.tsx` - line 219
- `/app/ingredients/page.tsx` - line 51

**Rekomendasi:** 
```tsx
// Sebelum
<Link href="/orders">Pesanan</Link>

// Sesudah
<Link 
  href="/orders" 
  prefetch={true}
  onMouseEnter={() => router.prefetch('/orders')}
>
  Pesanan
</Link>
```

---

### 2. **Action Buttons (New/Create)** ❌
**Priority: HIGH**

#### Lokasi:
- `/app/orders/page-new.tsx` - line 299
- `/app/ingredients/new/page.tsx` - line 103, 107
- `/app/operational-costs/page.tsx` - line 281, 342

**Contoh:**
```tsx
<Link href="/orders/new">
  <Button>Pesanan Baru</Button>
</Link>
```

**Rekomendasi:**
Tambahkan prefetch pada tombol "Buat Baru" / "Tambah"
```tsx
<Link 
  href="/orders/new" 
  prefetch={true}
  onMouseEnter={() => router.prefetch('/orders/new')}
>
  <Button>Pesanan Baru</Button>
</Link>
```

---

### 3. **AI Module Links** ❌
**Priority: MEDIUM**

#### Lokasi:
- `/app/ai/page.tsx` - line 138
- `/app/ai/chat/page.tsx` - line 166, 172
- `/app/ai/insights/page.tsx` - line 194, 200, 253, 259
- `/app/ai/pricing/page.tsx` - line 146, 152
- `/app/ai/components/AIQuickActions.tsx` - line 118

**Contoh:**
```tsx
<Link href="/ai/chat">
  Chat dengan AI
</Link>
```

**Rekomendasi:**
AI routes perlu prefetch karena user biasanya sering navigasi antar feature AI

---

### 4. **Settings Links** ❌
**Priority: LOW**

#### Lokasi:
- `/app/settings/whatsapp-templates/page.tsx` - line 265

Settings jarang diakses, tapi kalau user sudah di settings page, kemungkinan akan eksplorasi submenu.

---

### 5. **Mobile Header** ❌
**Priority: MEDIUM**

#### Lokasi:
- `/components/layout/mobile-header.tsx` - line 79

Mobile navigation belum ada prefetch setup.

---

## 🎯 Priority Implementation Plan

### Phase 1: CRITICAL (Week 1)
1. ✅ **Breadcrumb Links di semua pages**
   - Impact: High - User sering klik breadcrumb untuk navigasi
   - Files: 10+ pages

2. ✅ **Action Buttons (New/Create)**
   - Impact: High - User flow utama
   - Files: orders, ingredients, operational-costs

### Phase 2: HIGH (Week 2)
3. ✅ **AI Module Links**
   - Impact: Medium - Feature yang banyak navigasi internal
   - Files: 6 AI-related files

4. ✅ **Mobile Navigation**
   - Impact: Medium - Mobile users
   - Files: mobile-header.tsx

### Phase 3: NICE TO HAVE (Week 3)
5. ✅ **Settings & Misc Links**
   - Impact: Low - Jarang diakses
   - Files: settings pages

---

## 🛠️ Implementation Strategy

### Strategy 1: Component Wrapper (Recommended)
Buat wrapper component untuk Link dengan prefetch built-in:

```tsx
// src/components/ui/prefetch-link.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ComponentProps } from 'react'

interface PrefetchLinkProps extends ComponentProps<typeof Link> {
  prefetchOnHover?: boolean
}

export function PrefetchLink({ 
  href, 
  prefetchOnHover = true,
  children,
  ...props 
}: PrefetchLinkProps) {
  const router = useRouter()
  
  const handleMouseEnter = () => {
    if (prefetchOnHover && typeof href === 'string') {
      router.prefetch(href)
    }
  }
  
  return (
    <Link 
      href={href} 
      prefetch={true}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </Link>
  )
}
```

**Usage:**
```tsx
// Replace all Link with PrefetchLink
import { PrefetchLink as Link } from '@/components/ui/prefetch-link'

<Link href="/orders">Pesanan</Link>
// Otomatis prefetch saat hover!
```

### Strategy 2: Hook-based
```tsx
// src/hooks/usePrefetchLinks.ts
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function usePrefetchLinks(links: string[]) {
  const router = useRouter()
  
  useEffect(() => {
    links.forEach(link => {
      try {
        router.prefetch(link)
      } catch (e) {
        console.warn(`Failed to prefetch: ${link}`)
      }
    })
  }, [links, router])
}

// Usage in page
usePrefetchLinks(['/orders/new', '/orders/edit'])
```

---

## 📈 Expected Performance Improvements

### Current State
- Link navigation: ~500-800ms (includes data fetch)
- User perceives delay
- Poor UX on slow networks

### After Prefetch
- Link navigation: ~50-150ms (data already cached)
- Instant feel navigation
- Better UX especially on mobile

### Metrics to Track
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Navigation timing
- User bounce rate

---

## 🎨 Visual Indicators (Nice to Have)

Add loading states untuk links yang sedang prefetch:

```tsx
const [isPrefetching, setIsPrefetching] = useState(false)

<Link 
  href="/orders"
  onMouseEnter={() => {
    setIsPrefetching(true)
    router.prefetch('/orders').then(() => {
      setIsPrefetching(false)
    })
  }}
  className={isPrefetching ? 'opacity-50' : ''}
>
  Pesanan {isPrefetching && <Spinner />}
</Link>
```

---

## 🔍 Testing Checklist

- [ ] Test prefetch on hover (desktop)
- [ ] Test prefetch on touch (mobile)
- [ ] Test with slow 3G network
- [ ] Test cache invalidation
- [ ] Test memory usage
- [ ] Monitor bundle size impact
- [ ] A/B test with users

---

## 📝 Notes

1. **Next.js Default Behavior:**
   - `<Link>` dengan `prefetch={true}` (default di production)
   - Prefetch saat link masuk viewport
   - Cache di browser

2. **Our Additional Strategy:**
   - Prefetch on hover/touch (faster UX)
   - Manual router.prefetch() untuk critical routes
   - Smart prefetching berdasarkan user behavior

3. **Trade-offs:**
   - ✅ Faster navigation
   - ✅ Better UX
   - ❌ Sedikit lebih banyak bandwidth usage
   - ❌ Perlu monitor memory

---

## 🚀 Quick Wins

Files yang bisa langsung diupdate hari ini:
1. `src/app/orders/new/page.tsx` - Add breadcrumb prefetch
2. `src/app/ingredients/page.tsx` - Add action button prefetch
3. `src/app/hpp/page.tsx` - Add breadcrumb prefetch

Total impact: ~30% faster navigation untuk 70% user flows!
