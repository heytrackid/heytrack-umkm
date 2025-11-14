# Stack Auth Flow - HeyTrack

## 🔐 Authentication Flow

### Halaman Login
**URL:** `http://localhost:3000/handler/sign-in`

Ketika user belum login dan mengakses aplikasi, mereka akan otomatis diarahkan ke halaman login Stack Auth.

### Flow Lengkap

```
1. User mengakses http://localhost:3000
   ↓
2. Middleware cek authentication
   ↓
3. Jika BELUM login → Redirect ke /handler/sign-in
   ↓
4. User login via Stack Auth
   ↓
5. Setelah login → Redirect ke /dashboard
   ↓
6. User bisa akses semua halaman protected
```

---

## 📍 URL Penting

### Development
- **Login:** `http://localhost:3000/handler/sign-in`
- **Sign Up:** `http://localhost:3000/handler/sign-up`
- **Dashboard:** `http://localhost:3000/dashboard`
- **Account Settings:** `http://localhost:3000/handler/account-settings`

### Production
- **Login:** `https://app.heytrack.id/handler/sign-in`
- **Sign Up:** `https://app.heytrack.id/handler/sign-up`
- **Dashboard:** `https://app.heytrack.id/dashboard`

---

## 🛡️ Protected Routes

Semua routes **KECUALI** `/handler/*` memerlukan authentication:

### Protected (Perlu Login)
- ✅ `/dashboard` - Dashboard utama
- ✅ `/ingredients` - Manajemen bahan baku
- ✅ `/recipes` - Manajemen resep
- ✅ `/orders` - Manajemen pesanan
- ✅ `/customers` - Manajemen pelanggan
- ✅ `/suppliers` - Manajemen supplier
- ✅ `/reports` - Laporan & analytics
- ✅ `/ai-chatbot` - AI Assistant
- ✅ `/api/*` - Semua API endpoints

### Public (Tidak Perlu Login)
- ❌ `/handler/sign-in` - Halaman login
- ❌ `/handler/sign-up` - Halaman registrasi
- ❌ `/handler/forgot-password` - Reset password
- ❌ `/handler/account-settings` - Settings (tapi perlu login untuk akses)

---

## ⚙️ Konfigurasi

### Stack Client (`src/stack/client.tsx`)
```typescript
export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/handler/sign-in",           // Halaman login
    afterSignIn: "/dashboard",            // Redirect setelah login
    afterSignOut: "/handler/sign-in",     // Redirect setelah logout
  },
});
```

### Middleware (`src/middleware.ts`)
```typescript
// Check authentication for protected routes
if (isProtectedRoute(pathname)) {
  const user = await stackServerApp.getUser()
  
  if (!user) {
    // Redirect to sign-in page if not authenticated
    const url = request.nextUrl.clone()
    url.pathname = '/handler/sign-in'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
}
```

**Fitur:**
- ✅ Auto-redirect ke login jika belum authenticated
- ✅ Simpan URL tujuan di query param `redirect`
- ✅ Setelah login, redirect ke URL tujuan atau dashboard

---

## 🔄 Redirect Flow

### Contoh 1: Akses Dashboard Tanpa Login
```
1. User buka: http://localhost:3000/dashboard
2. Middleware detect: user = null
3. Redirect ke: http://localhost:3000/handler/sign-in?redirect=/dashboard
4. User login
5. Stack Auth redirect ke: /dashboard
```

### Contoh 2: Akses Root URL
```
1. User buka: http://localhost:3000/
2. Middleware detect: user = null
3. Redirect ke: http://localhost:3000/handler/sign-in?redirect=/
4. User login
5. Stack Auth redirect ke: /dashboard (karena afterSignIn config)
```

### Contoh 3: Sudah Login
```
1. User buka: http://localhost:3000/ingredients
2. Middleware detect: user = { id: "...", email: "..." }
3. Allow access → Tampilkan halaman ingredients
```

---

## 🧪 Testing Auth Flow

### 1. Test Redirect ke Login
```bash
# Buka browser dalam incognito mode
# Akses: http://localhost:3000/dashboard
# Expected: Redirect ke /handler/sign-in?redirect=/dashboard
```

### 2. Test Login Flow
```bash
# 1. Buka: http://localhost:3000/handler/sign-in
# 2. Login dengan credentials
# 3. Expected: Redirect ke /dashboard
```

### 3. Test Protected API
```bash
# Tanpa auth
curl http://localhost:3000/api/orders
# Expected: 401 Unauthorized

# Dengan auth (setelah login di browser)
curl http://localhost:3000/api/orders \
  -H "Cookie: stack-session=..."
# Expected: 200 OK dengan data
```

---

## 🎨 Customisasi Halaman Login

Stack Auth menyediakan halaman login default di `/handler/sign-in`. Untuk customize:

### Option 1: Gunakan Stack Auth UI (Default)
```typescript
// src/app/handler/[...stack]/page.tsx
export default function Handler() {
  return <StackHandler fullPage />; // Full page Stack UI
}
```

### Option 2: Custom UI dengan Stack Components
```typescript
'use client'
import { SignIn } from "@stackframe/stack";

export default function CustomSignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <h1>HeyTrack Login</h1>
        <SignIn />
      </div>
    </div>
  );
}
```

---

## 🔑 Environment Variables

Pastikan env vars Stack Auth sudah diset:

```env
# Stack Auth (Required)
NEXT_PUBLIC_STACK_PROJECT_ID=your_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_key

# Optional: Custom domain
NEXT_PUBLIC_APP_DOMAIN=app.heytrack.id
```

---

## 📱 User Experience

### First Time User
1. Buka aplikasi → Redirect ke login
2. Klik "Sign Up" → Registrasi
3. Verifikasi email (jika enabled)
4. Login → Masuk ke dashboard
5. Onboarding wizard (jika ada)

### Returning User
1. Buka aplikasi
2. Jika session masih valid → Langsung masuk
3. Jika session expired → Redirect ke login
4. Login → Kembali ke halaman terakhir

### Logout
1. Klik logout button
2. Stack Auth clear session
3. Redirect ke `/handler/sign-in`

---

## 🐛 Troubleshooting

### Issue: Infinite Redirect Loop
**Penyebab:** Handler route tidak di-exclude dari auth check
**Solusi:** Pastikan `/handler/*` ada di `publicRoutes` di middleware

### Issue: 401 di API Routes
**Penyebab:** Cookie tidak terkirim atau JWT tidak valid
**Solusi:** 
1. Cek `credentials: 'include'` di fetch
2. Verify `SUPABASE_JWT_SECRET` di env
3. Cek Stack Auth session di browser DevTools

### Issue: Redirect Loop di Development
**Penyebab:** Stack Auth project ID tidak valid
**Solusi:** Verify env vars di `.env.local`

---

## ✅ Checklist

- [x] Stack Auth handler di `/handler/[...stack]`
- [x] Middleware redirect ke login jika belum auth
- [x] Protected routes configuration
- [x] Public routes (handler) di-exclude
- [x] URLs config di Stack client
- [x] After sign-in redirect ke dashboard
- [x] After sign-out redirect ke login
- [x] Redirect param untuk deep linking

**Status: PRODUCTION READY** 🚀

---

## 📚 Resources

- [Stack Auth Docs](https://docs.stack-auth.com/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Stack Auth Examples](https://github.com/stack-auth/stack/tree/main/examples)
