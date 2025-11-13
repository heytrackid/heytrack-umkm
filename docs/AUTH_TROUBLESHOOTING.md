# Authentication Troubleshooting Guide

## Masalah Umum & Solusi

### 1. User Tidak Bisa Login Setelah Registrasi

**Gejala:**
- Registrasi berhasil
- Saat login, muncul error "Email atau password salah"
- Atau redirect loop antara login dan dashboard

**Kemungkinan Penyebab:**

#### A. Email Confirmation Belum Dikonfirmasi
Jika Supabase Auth memerlukan email confirmation:

**Solusi:**
1. Buka Supabase Dashboard
2. Authentication → Settings
3. Scroll ke **Email Auth**
4. **Matikan** "Enable email confirmations" (untuk development)
5. Atau pastikan user sudah klik link konfirmasi di email

#### B. Cookie Tidak Ter-Set dengan Benar
Session cookie dari Supabase tidak ter-set di browser.

**Solusi:**
1. Cek browser DevTools → Application → Cookies
2. Pastikan ada cookies dengan prefix `sb-` (Supabase cookies)
3. Jika tidak ada, kemungkinan masalah di:
   - CORS configuration
   - Site URL di Supabase
   - Cookie settings di browser (third-party cookies blocked)

#### C. Site URL & Redirect URLs Salah
Supabase perlu tahu domain aplikasi untuk set cookies dengan benar.

**Solusi:**
1. Buka Supabase Dashboard
2. Authentication → URL Configuration
3. **Site URL**: Set ke `http://localhost:3000` (development) atau domain production
4. **Redirect URLs**: Tambahkan:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`
   - URL production jika ada

#### D. Rate Limiting
Terlalu banyak percobaan login/register dari IP yang sama.

**Solusi:**
- Tunggu 1 jam
- Atau gunakan IP berbeda (mobile hotspot, VPN)
- Atau tingkatkan rate limit di Supabase Dashboard

### 2. Redirect Loop (Login → Dashboard → Login)

**Gejala:**
- Setelah login berhasil, redirect ke dashboard
- Langsung redirect balik ke login page
- Loop terus menerus

**Penyebab:**
Middleware tidak bisa detect session karena cookie belum ter-set saat redirect.

**Solusi:**
Sudah diperbaiki dengan menambahkan delay 100ms setelah login berhasil sebelum redirect.

### 3. Error "Email atau Password Salah" Padahal Benar

**Kemungkinan Penyebab:**

#### A. Email Belum Dikonfirmasi
Jika email confirmation enabled, user harus konfirmasi email dulu.

**Cek:**
```sql
-- Di Supabase SQL Editor
SELECT email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'user@example.com';
```

Jika `email_confirmed_at` NULL, berarti belum konfirmasi.

**Solusi:**
- Kirim ulang email konfirmasi
- Atau matikan email confirmation requirement

#### B. User Tidak Ada di Database
Registrasi gagal tapi tidak ada error message.

**Cek:**
```sql
-- Di Supabase SQL Editor
SELECT * FROM auth.users WHERE email = 'user@example.com';
```

Jika tidak ada hasil, berarti user belum terdaftar.

#### C. Password Salah
User lupa password atau typo saat registrasi.

**Solusi:**
- Gunakan fitur "Lupa Password"
- Atau reset password manual di Supabase Dashboard

### 4. Session Expired Terus Menerus

**Gejala:**
- Login berhasil
- Beberapa menit kemudian logout otomatis
- Muncul pesan "Sesi Anda telah berakhir"

**Penyebab:**
- Refresh token tidak ter-set dengan benar
- Middleware tidak refresh session

**Solusi:**
Sudah ditangani di `src/utils/supabase/middleware.ts` dengan `updateSession()`.

## Tools untuk Debug

### 1. Auth Debug Page
Akses: `http://localhost:3000/auth/debug`

Fitur:
- Cek session status
- Lihat cookies
- Test login
- Lihat user info

### 2. Browser DevTools

#### Console Tab
Cek error messages dari client-side:
```javascript
// Buka Console, jalankan:
document.cookie // Lihat cookies
localStorage // Lihat local storage
```

#### Network Tab
1. Buka Network tab
2. Filter: Fetch/XHR
3. Login atau register
4. Cek request ke `/api/auth/login` atau `/api/auth/register`
5. Lihat Response:
   - Status code (200 = success, 401 = unauthorized, 400 = bad request)
   - Response body (error message)

#### Application Tab
1. Buka Application tab
2. Cookies → http://localhost:3000
3. Cek cookies dengan prefix `sb-`:
   - `sb-<project-id>-auth-token`
   - `sb-<project-id>-auth-token-code-verifier`

### 3. Supabase Dashboard

#### Auth Logs
1. Buka Supabase Dashboard
2. Logs → Auth Logs
3. Filter by email atau timestamp
4. Lihat error messages

#### Users Table
1. Authentication → Users
2. Cari user berdasarkan email
3. Cek:
   - Email confirmed?
   - Last sign in
   - Created at

### 4. Server Logs
Jika running development server:
```bash
pnpm dev
```

Cek terminal untuk error messages dari API routes.

## Checklist Troubleshooting

Ikuti checklist ini secara berurutan:

### Step 1: Verifikasi Environment Variables
```bash
# Cek .env.local
cat .env.local | grep SUPABASE
```

Pastikan ada:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Cek Supabase Configuration

1. **Email Settings**
   - Dashboard → Authentication → Settings
   - Cek "Enable email confirmations"
   - Untuk development, sebaiknya dimatikan

2. **URL Configuration**
   - Dashboard → Authentication → URL Configuration
   - Site URL: `http://localhost:3000`
   - Redirect URLs: Tambahkan semua URL callback

3. **Email Templates**
   - Dashboard → Authentication → Email Templates
   - Pastikan template "Confirm signup" sudah benar
   - Test kirim email

### Step 3: Test Registrasi

1. Buka `http://localhost:3000/auth/register`
2. Daftar dengan email baru
3. Cek browser console untuk error
4. Cek Network tab untuk response
5. Jika berhasil, cek email untuk konfirmasi (jika enabled)

### Step 4: Test Login

1. Buka `http://localhost:3000/auth/login`
2. Login dengan kredensial yang baru didaftarkan
3. Cek browser console untuk error
4. Cek Network tab untuk response
5. Cek Application tab untuk cookies
6. Jika berhasil, harus redirect ke dashboard

### Step 5: Cek Session

1. Buka `http://localhost:3000/auth/debug`
2. Klik "Refresh Session Info"
3. Lihat:
   - `hasSession`: harus `true`
   - `hasUser`: harus `true`
   - `cookies.hasCookies`: harus `true`

### Step 6: Cek Database

```sql
-- Di Supabase SQL Editor
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

## Quick Fixes

### Fix 1: Reset Email Confirmation Requirement
```sql
-- Di Supabase SQL Editor
-- Konfirmasi email secara manual untuk user tertentu
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'user@example.com';
```

### Fix 2: Reset Password Manual
1. Supabase Dashboard → Authentication → Users
2. Cari user
3. Klik "..." → Reset Password
4. Kirim email reset password

### Fix 3: Clear All Cookies & Cache
```javascript
// Di Browser Console
// Clear cookies
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// Clear localStorage
localStorage.clear();

// Reload
location.reload();
```

### Fix 4: Restart Development Server
```bash
# Stop server (Ctrl+C)
# Clear Next.js cache
pnpm clean

# Start fresh
pnpm dev
```

## Common Error Messages

| Error Message | Penyebab | Solusi |
|--------------|----------|--------|
| "Email atau password salah" | Kredensial salah atau email belum dikonfirmasi | Cek password, atau konfirmasi email |
| "Email belum dikonfirmasi" | Email confirmation enabled tapi belum dikonfirmasi | Cek inbox atau matikan email confirmation |
| "Akun tidak ditemukan" | User belum registrasi | Daftar terlebih dahulu |
| "Gagal membuat sesi" | Cookie tidak ter-set | Cek Site URL di Supabase |
| "Koneksi gagal" | Network error atau server down | Cek koneksi internet dan server status |
| "Sesi Anda telah berakhir" | Session expired | Login ulang |

## Kontak Support

Jika masalah masih berlanjut:

1. **Cek Supabase Status**: https://status.supabase.com
2. **Supabase Discord**: https://discord.supabase.com
3. **GitHub Issues**: Buat issue dengan detail:
   - Error message lengkap
   - Screenshot browser console
   - Screenshot Network tab
   - Supabase Auth logs
