# Session Handling & 401 Error Fix

## Masalah

Error 401 (Unauthorized) terjadi ketika:
- Session token sudah expired
- Refresh token gagal
- User sudah logout tapi masih mencoba akses protected routes
- Cookies corrupt atau terhapus

## Solusi yang Diterapkan

### 1. Auto Refresh Token

File: `src/utils/supabase/client.ts`

Menambahkan konfigurasi auto refresh token pada Supabase client:

```typescript
auth: {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  flowType: 'pkce'
}
```

### 2. Auth State Listener

File: `src/providers/SupabaseProvider.tsx`

Menambahkan listener untuk mendeteksi perubahan auth state:
- SIGNED_OUT: Redirect ke login
- TOKEN_REFRESHED: Log success

### 3. Session Expired Handler

File: `src/lib/auth/session-handler.ts`

Utility functions untuk:
- Mendeteksi error session expired
- Clear localStorage
- Redirect ke login dengan parameter

### 4. Global Error Handler

File: `src/lib/errors/client-error-handler.ts`

Menambahkan handling khusus untuk error 401:
- Deteksi session expired
- Auto clear session
- Redirect ke login

### 5. Login Page Enhancement

File: `src/app/auth/login/page.tsx`

Menampilkan notifikasi jika user diredirect karena session expired.

## Cara Kerja

1. Ketika token akan expired, Supabase client otomatis refresh
2. Jika refresh gagal, auth state berubah ke SIGNED_OUT
3. Provider mendeteksi dan redirect ke login
4. Jika ada API call yang return 401, error handler akan:
   - Clear semua data auth di localStorage
   - Redirect ke login dengan parameter `?session_expired=true`
5. Login page menampilkan pesan "Sesi Anda telah berakhir"

## Testing

Untuk test session handling:

1. Login ke aplikasi
2. Buka DevTools > Application > Cookies
3. Hapus cookies Supabase
4. Refresh page atau lakukan API call
5. Seharusnya otomatis redirect ke login dengan pesan session expired

## Troubleshooting

Jika masih ada error 401:

1. Clear browser cache dan cookies
2. Logout dan login kembali
3. Check environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Check Supabase logs untuk detail error
