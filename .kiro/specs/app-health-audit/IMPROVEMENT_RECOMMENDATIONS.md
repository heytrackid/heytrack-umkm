# Rekomendasi Perbaikan & Improvement

**Tanggal:** 23 Oktober 2025  
**Status:** Ditemukan 8 area yang perlu diperbaiki

---

## 🔴 Critical Issues (Harus Diperbaiki)

### 1. Missing Imports di Dashboard Page ❌

**File:** `src/app/dashboard/page.tsx`

**Masalah:**
```typescript
const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth()
const { toast } = useToast()
const router = useRouter()
```

Import statements untuk `useAuth`, `useToast`, dan `useRouter` **TIDAK ADA** di file ini!

**Dampak:**
- Dashboard akan error saat dijalankan
- TypeScript error
- Runtime error

**Solusi:**
```typescript
// Tambahkan di bagian atas file setelah import lainnya
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
```

**Priority:** 🔴 CRITICAL - Harus diperbaiki segera

---

### 2. Inconsistent Supabase Client Usage ⚠️

**File:** `src/app/page.tsx`

**Masalah:**
```typescript
// Menggunakan deprecated client
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
const supabase = createClientComponentClient()
```

Sementara file lain menggunakan:
```typescript
import { createClient } from '@/utils/supabase/client'
const supabase = createClient()
```

**Dampak:**
- Inconsistency dalam codebase
- Menggunakan deprecated package
- Potensi bug di masa depan

**Solusi:**
```typescript
// Ganti dengan client yang konsisten
import { createClient } from '@/utils/supabase/client'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  
  // ... rest of code
}
```

**Priority:** 🟡 HIGH - Harus diperbaiki untuk konsistensi

---

## 🟡 High Priority Improvements

### 3. Duplicate Auth Check di Root Page

**File:** `src/app/page.tsx` dan `src/middleware.ts`

**Masalah:**
- Root page (`/`) melakukan auth check di client-side
- Middleware juga melakukan redirect untuk root page
- Double work yang tidak perlu

**Dampak:**
- Slower page load
- Flash of content
- Unnecessary client-side check

**Solusi:**
Hapus client-side check di `page.tsx` karena middleware sudah handle:

```typescript
// src/app/page.tsx - SIMPLIFIED VERSION
export default function HomePage() {
  // Middleware will handle redirect, just show loading
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat HeyTrack...</p>
      </div>
    </div>
  )
}
```

Atau lebih baik lagi, buat sebagai server component dengan redirect:

```typescript
// src/app/page.tsx - SERVER COMPONENT VERSION
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/auth/login')
  }
}
```

**Priority:** 🟡 HIGH - Improves performance

---

### 4. Missing Error Boundary

**Masalah:**
Tidak ada error boundary di level app untuk catch unexpected errors

**Dampak:**
- Jika ada error, seluruh app crash
- Poor user experience
- No graceful error handling

**Solusi:**
Buat error boundary:

```typescript
// src/app/error.tsx
'use client'

import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Terjadi Kesalahan</h2>
        <p className="text-muted-foreground">
          Maaf, terjadi kesalahan yang tidak terduga.
        </p>
        <Button onClick={reset}>Coba Lagi</Button>
      </div>
    </div>
  )
}
```

**Priority:** 🟡 HIGH - Better UX

---

## 🟢 Medium Priority Improvements

### 5. Session Refresh Strategy

**File:** `src/hooks/useAuth.ts`

**Masalah:**
Hook hanya refresh router pada SIGNED_IN/SIGNED_OUT, tidak handle TOKEN_REFRESHED

**Improvement:**
```typescript
supabase.auth.onAuthStateChange(
  async (event: string, session: Session | null) => {
    console.log('Auth state changed:', event)

    setAuthState({
      user: session?.user || null,
      session: session || null,
      isLoading: false,
      isAuthenticated: !!session?.user,
    })

    // Refresh router on auth changes
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
      router.refresh()
    }
    
    // Handle session expiry
    if (event === 'SIGNED_OUT' && session === null) {
      router.push('/auth/login?reason=session_expired')
    }
  }
)
```

**Priority:** 🟢 MEDIUM - Better session handling

---

### 6. Loading State Optimization

**File:** `src/app/dashboard/page.tsx`

**Masalah:**
Menggunakan setTimeout untuk simulate loading - ini tidak real

**Improvement:**
Gunakan real data fetching dengan proper loading states:

```typescript
// Remove setTimeout simulation
// Use real API calls with loading states

const { data: stats, isLoading: statsLoading } = useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: fetchDashboardStats,
})

const { data: orders, isLoading: ordersLoading } = useQuery({
  queryKey: ['recent-orders'],
  queryFn: fetchRecentOrders,
})
```

**Priority:** 🟢 MEDIUM - Real data instead of mock

---

### 7. Type Safety Improvements

**Masalah:**
Beberapa tempat menggunakan `any` type

**Contoh:**
```typescript
const recentOrders: any[] = []
const lowStockItems: any[] = []
```

**Improvement:**
```typescript
interface Order {
  id: string
  customer_name: string
  total_amount: number
  status: string
  created_at: string
}

interface StockItem {
  id: string
  name: string
  current_stock: number
  min_stock: number
  unit: string
}

const recentOrders: Order[] = []
const lowStockItems: StockItem[] = []
```

**Priority:** 🟢 MEDIUM - Better type safety

---

### 8. Middleware Performance

**File:** `src/middleware.ts`

**Improvement:**
Cache protected routes check untuk performa lebih baik:

```typescript
// Di luar function untuk avoid re-creation
const PROTECTED_ROUTES = new Set([
  '/dashboard',
  '/orders',
  '/ingredients',
  '/hpp',
  '/resep',
  '/customers',
  '/cash-flow',
  '/profit',
  '/settings',
  '/ai-chatbot',
  '/categories',
  '/operational-costs',
  '/reports',
])

export async function middleware(request: NextRequest) {
  // ...
  
  // Faster lookup with Set
  const isProtectedRoute = Array.from(PROTECTED_ROUTES).some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )
  
  // ...
}
```

**Priority:** 🟢 MEDIUM - Performance optimization

---

## 🔵 Low Priority / Nice to Have

### 9. Add Rate Limiting for Auth Endpoints

**Improvement:**
Tambahkan rate limiting untuk prevent brute force attacks

```typescript
// src/app/api/auth/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
})

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier)
  return success
}
```

**Priority:** 🔵 LOW - Security enhancement

---

### 10. Add Session Timeout Warning

**Improvement:**
Warn user sebelum session expire

```typescript
// src/hooks/useSessionTimeout.ts
export function useSessionTimeout() {
  const { session } = useAuth()
  const { toast } = useToast()
  
  useEffect(() => {
    if (!session) return
    
    const expiresAt = new Date(session.expires_at!)
    const now = new Date()
    const timeUntilExpiry = expiresAt.getTime() - now.getTime()
    
    // Warn 5 minutes before expiry
    const warningTime = timeUntilExpiry - (5 * 60 * 1000)
    
    if (warningTime > 0) {
      const timer = setTimeout(() => {
        toast({
          title: 'Sesi akan berakhir',
          description: 'Sesi Anda akan berakhir dalam 5 menit',
          variant: 'warning',
        })
      }, warningTime)
      
      return () => clearTimeout(timer)
    }
  }, [session, toast])
}
```

**Priority:** 🔵 LOW - UX enhancement

---

## 📋 Summary Checklist

### Critical (Harus Diperbaiki Sekarang)
- [ ] Fix missing imports di dashboard page
- [ ] Update inconsistent Supabase client usage

### High Priority (Diperbaiki Segera)
- [ ] Remove duplicate auth check di root page
- [ ] Add error boundary

### Medium Priority (Diperbaiki Nanti)
- [ ] Improve session refresh strategy
- [ ] Replace mock loading with real data
- [ ] Add proper TypeScript types
- [ ] Optimize middleware performance

### Low Priority (Nice to Have)
- [ ] Add rate limiting
- [ ] Add session timeout warning

---

## 🛠️ Quick Fix Script

Untuk memperbaiki critical issues dengan cepat:

```bash
# 1. Fix dashboard imports
# Edit src/app/dashboard/page.tsx dan tambahkan imports

# 2. Fix root page client
# Edit src/app/page.tsx dan ganti createClientComponentClient

# 3. Run type check
npm run type-check

# 4. Test the app
npm run dev
```

---

## 📊 Impact Analysis

| Issue | Severity | Impact | Effort | Priority |
|-------|----------|--------|--------|----------|
| Missing imports | Critical | App crash | 5 min | 🔴 P0 |
| Inconsistent client | High | Bugs | 10 min | 🟡 P1 |
| Duplicate auth check | High | Performance | 15 min | 🟡 P1 |
| Missing error boundary | High | UX | 20 min | 🟡 P1 |
| Session refresh | Medium | UX | 10 min | 🟢 P2 |
| Loading optimization | Medium | UX | 30 min | 🟢 P2 |
| Type safety | Medium | Maintainability | 20 min | 🟢 P2 |
| Middleware perf | Medium | Performance | 10 min | 🟢 P2 |
| Rate limiting | Low | Security | 1 hour | 🔵 P3 |
| Session warning | Low | UX | 30 min | 🔵 P3 |

**Total Estimated Time:**
- Critical fixes: 15 minutes
- High priority: 45 minutes
- Medium priority: 1 hour 10 minutes
- Low priority: 1 hour 30 minutes

**Recommended Action:**
Fix critical and high priority issues first (1 hour total), then tackle medium priority improvements.

---

## 🎯 Next Steps

1. **Immediate (Today):**
   - Fix missing imports di dashboard
   - Update Supabase client usage
   - Add error boundary

2. **This Week:**
   - Remove duplicate auth checks
   - Improve session handling
   - Add proper types

3. **Next Sprint:**
   - Optimize middleware
   - Add rate limiting
   - Add session warnings

---

## 📞 Questions?

Jika ada pertanyaan tentang rekomendasi ini:
- Review detail di setiap section
- Check impact analysis untuk prioritas
- Gunakan quick fix script untuk critical issues
