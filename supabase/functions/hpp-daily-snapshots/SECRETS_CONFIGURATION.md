# Edge Function Secrets Configuration Guide

## Langkah-langkah Configure Secrets

### Metode 1: Via Supabase Dashboard (Recommended)

1. **Buka Supabase Dashboard**
   - Pergi ke https://supabase.com/dashboard
   - Pilih project: **vrrjoswzmlhkmmcfhicw**

2. **Navigasi ke Edge Functions Settings**
   - Klik **Edge Functions** di sidebar
   - Pilih function **hpp-daily-snapshots**
   - Klik tab **Settings** atau **Secrets**

3. **Tambahkan Secrets**
   
   Tambahkan 2 secrets berikut:

   **Secret 1: SUPABASE_URL**
   ```
   Name: SUPABASE_URL
   Value: https://vrrjoswzmlhkmmcfhicw.supabase.co
   ```

   **Secret 2: SUPABASE_SERVICE_ROLE_KEY**
   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmpvc3d6bWxoa21tY2ZoaWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg3NjIyMSwiZXhwIjoyMDc0NDUyMjIxfQ.IvoSyipvAisF0J78NP1eSoqZiciAUVrQoFTrYrsxAnY
   ```

4. **Save Secrets**
   - Klik **Save** atau **Add Secret** untuk setiap secret
   - Pastikan kedua secrets tersimpan dengan benar

### Metode 2: Via Supabase CLI (Alternative)

Jika Anda memiliki akses CLI yang tepat, gunakan command berikut:

```bash
# Set SUPABASE_URL
supabase secrets set SUPABASE_URL=https://vrrjoswzmlhkmmcfhicw.supabase.co --project-ref vrrjoswzmlhkmmcfhicw

# Set SUPABASE_SERVICE_ROLE_KEY
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmpvc3d6bWxoa21tY2ZoaWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg3NjIyMSwiZXhwIjoyMDc0NDUyMjIxfQ.IvoSyipvAisF0J78NP1eSoqZiciAUVrQoFTrYrsxAnY --project-ref vrrjoswzmlhkmmcfhicw
```

## Verifikasi Secrets

### Test 1: Check Secrets List
Di dashboard, pastikan kedua secrets muncul di list:
- ✅ SUPABASE_URL
- ✅ SUPABASE_SERVICE_ROLE_KEY

### Test 2: Test Edge Function
Test function dengan curl untuk memastikan secrets bisa diakses:

```bash
curl -X POST https://vrrjoswzmlhkmmcfhicw.supabase.co/functions/v1/hpp-daily-snapshots \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmpvc3d6bWxoa21tY2ZoaWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg3NjIyMSwiZXhwIjoyMDc0NDUyMjIxfQ.IvoSyipvAisF0J78NP1eSoqZiciAUVrQoFTrYrsxAnY" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "total_users": X,
    "total_recipes": Y,
    "snapshots_created": Z,
    "snapshots_failed": 0,
    "execution_time_ms": XXX,
    "timestamp": "2025-01-23T..."
  }
}
```

### Test 3: Check Logs
Di Supabase Dashboard:
1. Buka **Edge Functions** > **hpp-daily-snapshots**
2. Klik tab **Logs**
3. Pastikan tidak ada error terkait missing environment variables
4. Cari log: `"HPP daily snapshots execution started"`

## Troubleshooting

### Error: "SUPABASE_URL is undefined"
- Pastikan secret `SUPABASE_URL` sudah ditambahkan
- Restart Edge Function jika perlu

### Error: "SUPABASE_SERVICE_ROLE_KEY is undefined"
- Pastikan secret `SUPABASE_SERVICE_ROLE_KEY` sudah ditambahkan
- Periksa tidak ada typo di nama secret

### Error: "Authorization failed"
- Pastikan menggunakan service role key yang benar di Authorization header
- Format: `Bearer <service_role_key>`

## Security Notes

⚠️ **PENTING**: 
- Service Role Key memiliki akses penuh ke database
- Jangan pernah expose key ini di client-side code
- Jangan commit key ini ke version control
- Hanya gunakan di server-side atau Edge Functions

## Next Steps

Setelah secrets berhasil dikonfigurasi:
1. ✅ Verifikasi secrets tersimpan dengan benar
2. ✅ Test Edge Function
3. ➡️ Lanjut ke sub-task 7.3: Apply database migration

---

**Requirements Covered**: 1.3, 4.5
