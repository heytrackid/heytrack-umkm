# Cara Mendapatkan JWT Secret dari Supabase

## 📍 Lokasi JWT Secret

JWT Secret ada di Supabase Dashboard:

1. **Buka Supabase Dashboard**: https://supabase.com/dashboard
2. **Pilih Project**: `vrrjoswzmlhkmmcfhicw` (dari .env.local kamu)
3. **Go to**: Settings → API
4. **Scroll ke bawah** sampai section "JWT Settings"
5. **Copy** nilai dari "JWT Secret"

## 🔑 Atau Via URL Langsung

Buka URL ini (ganti dengan project kamu):
```
https://supabase.com/dashboard/project/vrrjoswzmlhkmmcfhicw/settings/api
```

## 📝 Tambahkan ke .env.local

Setelah dapat JWT secret, tambahkan ke `.env.local`:

```env
# Add this line
SUPABASE_JWT_SECRET=your_jwt_secret_here
```

## ⚠️ Important Notes

- JWT Secret adalah **super secret** - jangan share ke siapapun!
- JWT Secret berbeda dengan ANON_KEY dan SERVICE_ROLE_KEY
- JWT Secret digunakan untuk **sign dan verify** JWT tokens
- Biasanya panjangnya 32-64 characters

## 🔍 Contoh Format

JWT Secret biasanya terlihat seperti ini:
```
super-secret-jwt-token-with-at-least-32-characters
```

Atau bisa juga base64 encoded string yang panjang.

## ✅ Setelah Dapat JWT Secret

1. Add ke `.env.local`
2. Restart dev server: `pnpm dev`
3. Run SQL migration (saya akan bantu)
