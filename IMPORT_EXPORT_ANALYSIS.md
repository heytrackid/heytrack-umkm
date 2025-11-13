# Analisis Import/Export Pattern - Next.js Best Practices

## Masalah yang Ditemukan

### 1. ❌ Dynamic Import untuk Named Exports - SALAH

**Lokasi**: `src/app/ai-chatbot/page.tsx`

**Kode Saat Ini (SALAH)**:
```tsx
const ChatHeader = dynamic(() => import('./components').then(mod => ({ default: mod.ChatHeader })), {
  loading: () => <div className="h-16 bg-muted animate-pulse rounded-t-xl" />
})

const ChatInput = dynamic(() => import('./components').then(mod => ({ default: mod.ChatInput })), {
  loading: () => <div className="h-20 bg-muted animate-pulse" />
})

const MessageList = dynamic(() => import('./components').then(mod => ({ default: mod.MessageList })), {
  loading: () => <div className="flex-1 bg-muted animate-pulse" />
})
```

**Masalah**:
- Membungkus named export dengan `{ default: ... }` adalah **SALAH**
- Ini akan menyebabkan error karena `ChatHeader`, `ChatInput`, dan `MessageList` adalah **named exports**, bukan default exports

**Kode yang Benar (sesuai Next.js docs)**:
```tsx
const ChatHeader = dynamic(() => import('./components').then(mod => mod.ChatHeader), {
  loading: () => <div className="h-16 bg-muted animate-pulse rounded-t-xl" />
})

const ChatInput = dynamic(() => import('./components').then(mod => mod.ChatInput), {
  loading: () => <div className="h-20 bg-muted animate-pulse" />
})

const MessageList = dynamic(() => import('./components').then(mod => mod.MessageList), {
  loading: () => <div className="flex-1 bg-muted animate-pulse" />
})
```

**Referensi Next.js Docs**:
> To dynamically import a named export, you can return it from the Promise returned by import() function:
> ```jsx
> const ClientComponent = dynamic(() =>
>   import('../components/hello').then((mod) => mod.Hello)
> )
> ```

### 2. ✅ Dynamic Import untuk Default Exports - BENAR

**Lokasi**: `src/app/dashboard/components/lazy-dashboard-components.tsx`

**Kode (BENAR)**:
```tsx
const LazyHppDashboardWidget = dynamic(() => import('./HppDashboardWidget'), {
  loading: () => <StatsCardsSkeleton />
})

const LazyRecentOrdersSection = dynamic(() => import('./RecentOrdersSection'), {
  loading: () => <RecentOrdersSkeleton />
})
```

**Penjelasan**:
- Ini benar karena komponen yang di-import menggunakan **default export**
- Tidak perlu `.then()` untuk default exports

### 3. ⚠️ Penggunaan `export const dynamic = 'force-dynamic'`

**Lokasi**: `src/app/recipes/layout.tsx`

**Kode**:
```tsx
// Force dynamic rendering
export const dynamic = 'force-dynamic'
```

**Catatan**:
- Ini adalah **Route Segment Config**, bukan dynamic import
- Ini **BENAR** dan sesuai dengan Next.js docs
- Digunakan untuk mengontrol rendering behavior (static vs dynamic)

## Dokumentasi Next.js - Named Exports Pattern

Dari dokumentasi resmi Next.js (https://nextjs.org/docs/app/guides/lazy-loading):

### Importing Named Exports

```jsx
// Component file with named export
// components/hello.js
'use client'

export function Hello() {
  return <p>Hello!</p>
}

// Page file importing named export
// app/page.js
import dynamic from 'next/dynamic'

const ClientComponent = dynamic(() =>
  import('../components/hello').then((mod) => mod.Hello)
)
```

**Key Points**:
1. Untuk named exports, gunakan `.then((mod) => mod.ComponentName)`
2. **JANGAN** bungkus dengan `{ default: ... }`
3. Return langsung named export dari module

## Rekomendasi Perbaikan

### File yang Perlu Diperbaiki

1. **`src/app/ai-chatbot/page.tsx`**
   - Ubah semua dynamic import untuk named exports
   - Hapus `{ default: ... }` wrapper
   - Gunakan pattern: `.then(mod => mod.ComponentName)`

### Pattern yang Benar

```tsx
// ✅ BENAR - Named Export
const Component = dynamic(() => 
  import('./components').then(mod => mod.Component)
)

// ✅ BENAR - Default Export
const Component = dynamic(() => import('./Component'))

// ❌ SALAH - Named Export dengan default wrapper
const Component = dynamic(() => 
  import('./components').then(mod => ({ default: mod.Component }))
)
```

## Dampak Masalah

### Masalah Potensial:
1. **Runtime Error**: Component mungkin tidak ter-load dengan benar
2. **Type Error**: TypeScript mungkin mengeluh tentang type mismatch
3. **Bundle Size**: Tidak optimal karena code splitting tidak bekerja dengan benar
4. **Performance**: Loading component bisa gagal atau lambat

### Gejala yang Mungkin Muncul:
- Component tidak muncul di halaman
- Error di console: "Cannot read property 'default' of undefined"
- Loading state tidak pernah selesai
- Blank screen atau component tidak render

## Kesimpulan

Codebase **BELUM SESUAI** dengan dokumentasi Next.js untuk dynamic import named exports. Perlu perbaikan di file `src/app/ai-chatbot/page.tsx` untuk mengikuti pattern yang benar sesuai dokumentasi resmi Next.js.

## Referensi

- [Next.js Lazy Loading Docs](https://nextjs.org/docs/app/guides/lazy-loading)
- [Next.js Dynamic Import API](https://nextjs.org/docs/app/api-reference/functions/next-dynamic)
- [React.lazy() Documentation](https://react.dev/reference/react/lazy)
