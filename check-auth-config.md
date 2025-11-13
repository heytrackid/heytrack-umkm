# Checklist: Fix Session Expired Issue

## ✅ Yang Sudah Diperbaiki:

1. **AuthProvider sekarang pakai `getUser()` bukan `getSession()`**
   - `getUser()` memvalidasi token ke server Supabase
   - `getSession()` hanya baca dari local storage (tidak aman)

## 🔍 Yang Perlu Dicek di Supabase Dashboard:

### 1. Session Settings
Buka: https://supabase.com/dashboard/project/vrrjoswzmlhkmmcfhicw/settings/auth

Cek pengaturan ini:
- **JWT Expiry**: Berapa lama token valid? (default: 3600 detik = 1 jam)
- **Refresh Token Rotation**: Harus ENABLED
- **Reuse Interval**: Berapa lama refresh token bisa dipakai ulang? (default: 10 detik)

### 2. Recommended Settings untuk Production:

```
JWT Expiry: 3600 (1 hour)
Refresh Token Rotation: Enabled
Reuse Interval: 10
```

### 3. Untuk Development (lebih lama):

```
JWT Expiry: 86400 (24 hours)
Refresh Token Rotation: Enabled  
Reuse Interval: 10
```

## 🐛 Debugging Session Issues:

### Test 1: Cek apakah token di-refresh otomatis
```javascript
// Di browser console
const supabase = window.supabase.createClient(
  'https://vrrjoswzmlhkmmcfhicw.supabase.co',
  'sb_publishable_tpQT__d0CVP5L6BBBoBY6g_6YDOlmRw'
)

// Login
await supabase.auth.signInWithPassword({
  email: 'heytrackid@gmail.com',
  password: 'your-password'
})

// Cek session
const { data: { session } } = await supabase.auth.getSession()
console.log('Session expires at:', new Date(session.expires_at * 1000))
console.log('Time until expiry:', (session.expires_at * 1000 - Date.now()) / 1000 / 60, 'minutes')
```

### Test 2: Monitor auth state changes
```javascript
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event)
  console.log('Session:', session)
})
```

## 🔧 Additional Fixes Needed:

### 1. Update client.ts untuk auto-refresh
File: `src/utils/supabase/client.ts`

Pastikan ada:
```typescript
auth: {
  persistSession: true,
  autoRefreshToken: true,  // ✅ Sudah ada
  detectSessionInUrl: true,
  flowType: 'pkce',
}
```

### 2. Tambahkan session refresh interval di AuthProvider

Tambahkan auto-refresh setiap 50 menit (sebelum token expired):

```typescript
useEffect(() => {
  // Auto-refresh session every 50 minutes (before 1 hour expiry)
  const interval = setInterval(() => {
    void refreshSession()
  }, 50 * 60 * 1000) // 50 minutes

  return () => clearInterval(interval)
}, [refreshSession])
```

## 📝 Common Issues:

1. **Session expired setelah refresh page**
   - Middleware tidak jalan → Cek matcher config
   - Cookies tidak tersimpan → Cek browser settings (allow cookies)

2. **Session expired setelah beberapa menit**
   - JWT expiry terlalu pendek → Ubah di dashboard
   - Auto-refresh tidak jalan → Cek `autoRefreshToken: true`

3. **Session expired random**
   - Refresh token rotation issue → Pastikan enabled
   - Multiple tabs conflict → Supabase handle ini otomatis

## 🎯 Next Steps:

1. ✅ Update AuthProvider (DONE)
2. ⏳ Cek Supabase dashboard settings
3. ⏳ Test login dan tunggu 5-10 menit
4. ⏳ Cek apakah session masih valid
5. ⏳ Monitor browser console untuk auth events
