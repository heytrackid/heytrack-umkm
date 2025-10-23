# Quick Deploy Instructions - HPP Daily Snapshots

## Status Check ✅
- ✅ pg_cron extension: ENABLED (v1.6.4)
- ✅ pg_net extension: ENABLED (v0.19.5)
- ❌ Edge Function: NOT DEPLOYED YET
- ❌ Cron Job: NOT SCHEDULED YET

## Option 1: Deploy via Supabase CLI (Recommended)

Jika kamu punya akses CLI yang proper, jalankan:

```bash
supabase functions deploy hpp-daily-snapshots --project-ref vrrjoswzmlhkmmcfhicw
```

## Option 2: Deploy via Dashboard (Manual)

### Step 1: Buka Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/vrrjoswzmlhkmmcfhicw
2. Click **Edge Functions** di sidebar
3. Click **Deploy a new function**

### Step 2: Upload Function
Pilih salah satu:

**A. Upload ZIP File**
- File sudah tersedia: `supabase/functions/hpp-daily-snapshots.zip`
- Upload file tersebut
- Function name: `hpp-daily-snapshots`

**B. Create from Scratch**
- Function name: `hpp-daily-snapshots`
- Copy-paste content dari setiap file:
  - `index.ts` (main file)
  - `types.ts`
  - `utils.ts`
  - `hpp-calculator.ts`
  - `snapshot-manager.ts`

### Step 3: Configure Secrets
Setelah function deployed, tambahkan secrets:

1. Go to function settings/secrets
2. Add:
   - `SUPABASE_URL` = `https://vrrjoswzmlhkmmcfhicw.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = (lihat di .env file)

### Step 4: Test Function
```bash
curl -X POST https://vrrjoswzmlhkmmcfhicw.supabase.co/functions/v1/hpp-daily-snapshots \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json"
```

## Option 3: Let Me Try CLI Deployment

Jika kamu sudah login ke Supabase CLI dan punya permissions, saya bisa coba deploy via CLI.

Mau coba option mana?
1. CLI deployment (butuh proper permissions)
2. Manual via Dashboard (paling reliable)
3. Saya buatkan single-file version untuk easier deployment

---

**Current Files Location**:
- All source files: `supabase/functions/hpp-daily-snapshots/`
- ZIP file: `supabase/functions/hpp-daily-snapshots.zip`
- Service role key: Check `.env` file
