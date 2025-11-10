# Turnstile Quick Start - Setup Production Keys

## 🚀 Langkah Cepat (5 Menit)

### 1. Daftar di Cloudflare (Gratis)

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Login atau buat akun baru (gratis)
3. Pilih account Anda

### 2. Buat Turnstile Site

1. Di sidebar, klik **Turnstile**
2. Klik tombol **Add Site**
3. Isi form:
   - **Site name**: `HeyTrack Production` (atau nama lain)
   - **Domain**: Masukkan domain Anda, contoh:
     - Production: `app.heytrack.id`
     - Staging: `staging.heytrack.id`
     - Development: `localhost` (atau kosongkan untuk semua domain)
   - **Widget Mode**: Pilih **Managed** (recommended)
   - **Pre-Clearance**: Biarkan default
4. Klik **Create**

### 3. Copy API Keys

Setelah site dibuat, Anda akan melihat:
- **Site Key** (public, aman untuk di-expose)
- **Secret Key** (private, jangan di-expose!)

### 4. Update Environment Variables

Buka file `.env.local` di project Anda, update:

```bash
# Cloudflare Turnstile (Production)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA  # Ganti dengan Site Key Anda
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA  # Ganti dengan Secret Key Anda
```

**Penting**: 
- Jangan commit `.env.local` ke Git!
- Untuk production (Vercel/hosting), set environment variables di dashboard hosting

### 5. Test

1. Restart dev server: `pnpm dev`
2. Buka halaman login: `http://localhost:3000/auth/login`
3. Anda akan melihat Turnstile widget
4. Coba login - widget akan verify otomatis

## ✅ Sudah Terintegrasi Di:

- ✅ **Login Page** (`/auth/login`)
- ✅ **Register Page** (`/auth/register`)

## 🔧 Konfigurasi Tambahan (Opsional)

### Multiple Environments

Buat site terpisah untuk setiap environment:

**Development** (`.env.local`):
```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA  # Test key (always pass)
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

**Staging** (Vercel/hosting):
```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-staging-site-key
TURNSTILE_SECRET_KEY=your-staging-secret-key
```

**Production** (Vercel/hosting):
```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-production-site-key
TURNSTILE_SECRET_KEY=your-production-secret-key
```

### Widget Customization

Edit `src/components/security/TurnstileWidget.tsx` untuk customize:

```tsx
<TurnstileWidget
  theme="light"    // 'light' | 'dark' | 'auto'
  size="compact"   // 'normal' | 'compact'
  onVerify={handleVerify}
/>
```

## 📊 Monitoring

Lihat analytics di Cloudflare Dashboard:
- Total verifications
- Success rate
- Challenge solve rate
- Geographic distribution

## 🆘 Troubleshooting

### Widget tidak muncul?
- Check browser console untuk errors
- Pastikan `NEXT_PUBLIC_TURNSTILE_SITE_KEY` sudah di-set
- Restart dev server

### Verification gagal terus?
- Pastikan `TURNSTILE_SECRET_KEY` benar
- Check domain sudah terdaftar di Cloudflare
- Lihat error di browser console

### Test keys tidak bekerja?
Test keys hanya untuk development. Untuk production, gunakan real keys dari Cloudflare.

## 📚 Dokumentasi Lengkap

Lihat `docs/TURNSTILE_SETUP.md` untuk:
- Advanced usage
- Custom implementation
- API integration
- Best practices
- Migration guide

## 🎯 Next Steps

Setelah setup:
1. Test di development
2. Deploy ke staging dengan staging keys
3. Test di staging
4. Deploy ke production dengan production keys
5. Monitor analytics di Cloudflare Dashboard

---

**Selesai!** Turnstile sudah aktif di halaman login dan register Anda. 🎉
