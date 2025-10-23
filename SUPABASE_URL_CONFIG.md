# Supabase URL Configuration

## Redirect URLs yang Perlu Ditambahkan di Supabase Dashboard

Buka Supabase Dashboard → Authentication → URL Configuration

### Site URL
```
http://localhost:3000
```
(Untuk production, ganti dengan domain production Anda)

### Redirect URLs (Allowed)
Tambahkan semua URL berikut:

```
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
http://localhost:3000/auth/update-password
http://localhost:3000/dashboard
```

### Untuk Production (tambahkan juga):
```
https://yourdomain.com/auth/callback
https://yourdomain.com/auth/confirm
https://yourdomain.com/auth/update-password
https://yourdomain.com/dashboard
```

## Email Templates

Di Supabase Dashboard → Authentication → Email Templates, pastikan:

### Confirm Signup
```
{{ .ConfirmationURL }}
```
Harus mengarah ke: `http://localhost:3000/auth/confirm`

### Reset Password
```
{{ .ConfirmationURL }}
```
Harus mengarah ke: `http://localhost:3000/auth/update-password`

## Cara Setting di Supabase:

1. Buka https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **Authentication** di sidebar
4. Klik **URL Configuration**
5. Tambahkan semua URL di atas ke **Redirect URLs**
6. Klik **Save**
