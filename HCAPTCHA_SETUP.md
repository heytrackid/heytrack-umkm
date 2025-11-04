# Konfigurasi hCaptcha untuk HeyTrack

## Langkah-langkah Setup hCaptcha

1. **Buat akun di hCaptcha**
   - Kunjungi [https://www.hcaptcha.com/](https://www.hcaptcha.com/)
   - Daftar akun gratis atau berlangganan sesuai kebutuhan

2. **Buat aplikasi hCaptcha baru**
   - Login ke dashboard hCaptcha
   - Pilih "Admin" -> "Sites" -> "Add Site"
   - Isi informasi:
     - Nama situs: `HeyTrack`
     - Domain: `yourdomain.com` (dan `localhost` untuk development)
     - Tipe: `Checkbox`
   - Catat `Site Key` dan `Secret Key` yang dihasilkan

3. **Konfigurasi Environment Variables**

   Tambahkan ke `.env.local` (development) atau environment production Anda:

   ```env
   # hCaptcha Configuration
   NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your_public_site_key_here
   HCAPTCHA_SECRET_KEY=your_secret_key_here
   ```

   Contoh:
   ```env
   NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001
   HCAPTCHA_SECRET_KEY=0x0000000000000000000000000000000000000000
   ```

4. **Penting untuk Production**
   - Pastikan `HCAPTCHA_SECRET_KEY` TIDAK pernah di-commit ke repository
   - Gunakan environment variables di server production
   - Jangan pernah tampilkan `HCAPTCHA_SECRET_KEY` di kode client

## Deployment ke Production

1. **Set environment variables di production server**
   ```bash
   # Contoh untuk Vercel
   vercel env add HCAPTCHA_SECRET_KEY
   vercel env add NEXT_PUBLIC_HCAPTCHA_SITE_KEY
   ```

2. **Verifikasi konfigurasi**
   - Setelah deployment, pastikan hCaptcha muncul di halaman login dan register
   - Uji bahwa verifikasi berfungsi dengan benar

## Troubleshooting

Jika hCaptcha tidak muncul atau tidak berfungsi:

1. Pastikan `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` diatur di environment variabel
2. Periksa apakah domain Anda sudah didaftarkan di dashboard hCaptcha
3. Pastikan tidak ada pemblokir ekstensi browser yang memblokir hCaptcha
4. Lihat logs server untuk error verifikasi

## Keamanan

- Jangan pernah tampilkan `HCAPTCHA_SECRET_KEY` di kode client
- Gunakan konfigurasi timeout yang sesuai untuk mencegah serangan DoS
- Monitor penggunaan hCaptcha untuk mendeteksi aktivitas mencurigakan