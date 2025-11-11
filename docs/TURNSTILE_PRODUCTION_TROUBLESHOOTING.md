# Turnstile Production Troubleshooting

## Error: `/api/verify-turnstile` returns 400

### Kemungkinan Penyebab

#### 1. **Menggunakan Test Keys di Production**
Test keys (`1x00000000000000000000AA`) hanya berfungsi di localhost. Di production, kamu harus menggunakan real keys.

**Solusi:**
1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Pilih akun kamu → Turnstile
3. Buat site baru atau gunakan yang sudah ada
4. Copy **Site Key** dan **Secret Key**
5. Set di production environment variables:
   ```bash
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_real_site_key
   TURNSTILE_SECRET_KEY=your_real_secret_key
   ```

#### 2. **Environment Variables Tidak Di-Set**
Production environment mungkin tidak memiliki Turnstile keys.

**Solusi untuk Vercel:**
1. Buka project di Vercel Dashboard
2. Settings → Environment Variables
3. Tambahkan:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Production)
   - `TURNSTILE_SECRET_KEY` (Production)
4. Redeploy aplikasi

#### 3. **Domain Tidak Terdaftar**
Turnstile site key hanya berfungsi untuk domain yang terdaftar.

**Solusi:**
1. Buka Cloudflare Dashboard → Turnstile → Site Settings
2. Pastikan production domain kamu terdaftar di **Domains**
3. Contoh: `app.heytrack.id`, `heytrack.vercel.app`

#### 4. **Token Expired**
Turnstile token memiliki lifetime terbatas (biasanya 5 menit).

**Solusi:**
- Widget sudah di-set dengan `retry: 'auto'` untuk auto-refresh
- User harus submit form sebelum token expired
- Jika expired, widget akan auto-refresh

#### 5. **CSP Blocking Turnstile**
Content Security Policy mungkin memblokir Turnstile scripts.

**Solusi:**
CSP sudah di-update untuk mengizinkan:
- `script-src`: `https://challenges.cloudflare.com`
- `frame-src`: `https://challenges.cloudflare.com`
- `connect-src`: `https://challenges.cloudflare.com`

Pastikan middleware CSP sudah di-deploy.

## Debugging Steps

### 1. Cek Browser Console
Buka DevTools → Console, cari error dari Turnstile:
```
Turnstile error: [error details]
```

### 2. Cek Network Tab
Buka DevTools → Network:
1. Filter: `verify-turnstile`
2. Cek request payload:
   ```json
   {
     "token": "0.abc123..."
   }
   ```
3. Cek response:
   - **400**: Token invalid atau expired
   - **500**: Server configuration error
   - **502**: Cloudflare API error

### 3. Cek Server Logs
Di Vercel Dashboard → Deployments → Functions:
```
[POST /api/verify-turnstile] Received Turnstile token
[POST /api/verify-turnstile] Turnstile verification failed
```

Error codes dari Cloudflare:
- `missing-input-secret`: Secret key tidak di-set
- `invalid-input-secret`: Secret key salah
- `missing-input-response`: Token tidak dikirim
- `invalid-input-response`: Token invalid atau expired
- `timeout-or-duplicate`: Token sudah digunakan atau timeout

## Development vs Production

### Development (localhost)
```bash
# .env.local
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```
- Test keys selalu pass
- API endpoint bypass dengan `dev-bypass-token`

### Production
```bash
# Vercel Environment Variables
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAA... (real key)
TURNSTILE_SECRET_KEY=0x4AAAAAAA... (real secret)
```
- Harus menggunakan real keys
- Token di-verify dengan Cloudflare API

## Quick Fix Checklist

- [ ] Real Turnstile keys di-set di production environment
- [ ] Production domain terdaftar di Cloudflare Turnstile
- [ ] Environment variables di-redeploy (rebuild required)
- [ ] CSP headers mengizinkan `challenges.cloudflare.com`
- [ ] Browser console tidak ada error CSP
- [ ] Network request ke `/api/verify-turnstile` berhasil (200)

## Testing Production Setup

### 1. Test dengan cURL
```bash
# Get token dari browser (DevTools → Network → verify-turnstile → Request)
curl -X POST https://your-domain.com/api/verify-turnstile \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN_HERE"}'
```

Expected response:
```json
{
  "success": true,
  "hostname": "your-domain.com",
  "challengeTs": "2024-01-01T00:00:00Z"
}
```

### 2. Test Cloudflare API Directly
```bash
curl -X POST https://challenges.cloudflare.com/turnstile/v0/siteverify \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "YOUR_SECRET_KEY",
    "response": "YOUR_TOKEN"
  }'
```

## Fallback: Disable Turnstile Temporarily

Jika urgent dan Turnstile masih bermasalah, kamu bisa temporary disable:

```typescript
// src/components/security/TurnstileWidget.tsx
const isDev = true // Force development mode
```

**⚠️ WARNING**: Ini menghilangkan proteksi CAPTCHA. Hanya untuk debugging!

## Support

- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- [Turnstile Error Codes](https://developers.cloudflare.com/turnstile/troubleshooting/error-codes/)
