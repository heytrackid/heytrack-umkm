# HeyTrack Database Migration

## Overview
Migration lengkap untuk database HeyTrack dengan Stack Auth JWT authentication.

## File Migration

1. **00001_enums_and_extensions.sql** - Enums dan Extensions
2. **00002_core_tables.sql** - Tabel User & Settings
3. **00003_inventory_tables.sql** - Tabel Inventory
4. **00004_recipe_tables.sql** - Tabel Resep
5. **00005_order_tables.sql** - Tabel Order & Customer
6. **00006_production_financial_tables.sql** - Tabel Produksi & Keuangan
7. **00007_hpp_notification_tables.sql** - Tabel HPP & Notifikasi
8. **00008_remaining_tables.sql** - Tabel Lainnya
9. **00009_chat_tables.sql** - Tabel AI Chat
10. **00010_indexes.sql** - Database Indexes
11. **00011_rls_policies.sql** - Row Level Security Policies
12. **00012_views.sql** - Database Views
13. **00013_functions.sql** - Database Functions
14. **00014_triggers.sql** - Database Triggers
15. **00015_initial_data.sql** - Initial Setup & Data

## Cara Menjalankan Migration

### Option 1: Via Supabase Dashboard (Recommended)

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Buka **SQL Editor**
4. Jalankan file migration satu per satu sesuai urutan (00001 → 00015)
5. Atau gabungkan semua file dan jalankan sekaligus

### Option 2: Via Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push

# Generate TypeScript types
pnpm supabase:types
```

### Option 3: Via Script

```bash
# Jalankan script migration
bash scripts/run-migration.sh
```

## Konfigurasi JWT untuk Stack Auth

### 1. Set JWT Secret di Supabase

1. Buka Supabase Dashboard → Settings → API
2. Scroll ke **JWT Settings**
3. Set **JWT Secret** dengan value yang sama dengan `SUPABASE_JWT_SECRET` di `.env.local`

### 2. Environment Variables

Pastikan file `.env.local` memiliki:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID=your-stack-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your-publishable-key
STACK_SECRET_SERVER_KEY=your-secret-key
```

### 3. Verify JWT Configuration

Test dengan query ini di SQL Editor:

```sql
-- Test JWT extraction
SELECT auth.user_id();

-- Test RLS policy
SELECT * FROM ingredients LIMIT 1;
```

## Struktur Database

### Core Tables
- `user_profiles` - Profil pengguna
- `app_settings` - Pengaturan aplikasi
- `user_onboarding` - Status onboarding

### Inventory (13 tables)
- `ingredients` - Bahan baku
- `ingredient_purchases` - Pembelian
- `stock_transactions` - Transaksi stok
- `stock_reservations` - Reservasi stok
- `inventory_alerts` - Alert inventory
- `inventory_reorder_rules` - Aturan reorder
- `inventory_stock_logs` - Log stok
- `suppliers` - Supplier
- `supplier_ingredients` - Relasi supplier-ingredient
- `usage_analytics` - Analitik penggunaan

### Recipe (2 tables)
- `recipes` - Resep produk
- `recipe_ingredients` - Komposisi resep

### Order (4 tables)
- `customers` - Pelanggan
- `orders` - Pesanan
- `order_items` - Item pesanan
- `payments` - Pembayaran

### Production (3 tables)
- `productions` - Batch produksi
- `production_batches` - Detail batch
- `production_schedules` - Jadwal produksi

### Financial (2 tables)
- `financial_records` - Catatan keuangan
- `operational_costs` - Biaya operasional

### HPP (4 tables)
- `hpp_calculations` - Kalkulasi HPP
- `hpp_history` - Riwayat HPP
- `hpp_alerts` - Alert HPP
- `hpp_recommendations` - Rekomendasi

### Notification (2 tables)
- `notifications` - Notifikasi
- `notification_preferences` - Preferensi

### Chat (5 tables)
- `chat_sessions` - Sesi chat
- `chat_messages` - Pesan
- `chat_context_cache` - Cache konteks
- `conversation_sessions` - Sesi percakapan
- `conversation_history` - Riwayat

### Others (4 tables)
- `whatsapp_templates` - Template WhatsApp
- `daily_sales_summary` - Ringkasan penjualan
- `error_logs` - Log error
- `performance_logs` - Log performa

### Views (4 views)
- `inventory_status` - Status inventory
- `inventory_availability` - Ketersediaan inventory
- `order_summary` - Ringkasan order
- `recipe_availability` - Ketersediaan resep

### Functions (15+ functions)
- `calculate_ingredient_wac()` - Hitung WAC
- `calculate_recipe_hpp()` - Hitung HPP
- `increment_ingredient_stock()` - Tambah stok
- `decrement_ingredient_stock()` - Kurangi stok
- `get_dashboard_stats()` - Statistik dashboard
- Dan lainnya...

## RLS (Row Level Security)

Semua tabel menggunakan RLS dengan policy:
- User hanya bisa akses data mereka sendiri
- Filter berdasarkan `user_id` dari JWT token
- JWT token dari Stack Auth berisi `sub` atau `user_id`

## Testing Migration

### 1. Test Connection

```sql
SELECT NOW();
```

### 2. Test RLS

```sql
-- Harus return user_id dari JWT
SELECT auth.user_id();

-- Harus return empty jika belum ada data
SELECT * FROM ingredients;
```

### 3. Test Insert

```sql
INSERT INTO ingredients (user_id, name, unit, price_per_unit)
VALUES (auth.user_id(), 'Test Ingredient', 'kg', 10000);

SELECT * FROM ingredients;
```

### 4. Test Functions

```sql
SELECT get_dashboard_stats();
```

## Troubleshooting

### Error: "permission denied for schema public"
```sql
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
```

### Error: "function auth.user_id() does not exist"
Jalankan ulang file `00011_rls_policies.sql`

### Error: "relation does not exist"
Pastikan semua migration dijalankan sesuai urutan

### RLS Policy tidak bekerja
1. Verify JWT secret di Supabase dashboard
2. Check JWT token contains `sub` or `user_id`
3. Test dengan: `SELECT auth.user_id()`

## Next Steps

Setelah migration berhasil:

1. **Generate TypeScript Types**
   ```bash
   pnpm supabase:types
   ```

2. **Test Authentication**
   - Login via Stack Auth
   - Verify JWT token
   - Test API endpoints

3. **Verify RLS**
   - Test CRUD operations
   - Verify data isolation antar user

4. **Populate Initial Data**
   - Create test user
   - Add sample ingredients
   - Create sample recipes

5. **Run Application**
   ```bash
   pnpm dev
   ```

## Support

Jika ada masalah:
1. Check migration logs
2. Verify environment variables
3. Test JWT configuration
4. Check Supabase logs di Dashboard

## Backup

Sebelum migration, backup database:
```bash
supabase db dump -f backup.sql
```

Restore jika diperlukan:
```bash
psql -h db.xxx.supabase.co -U postgres -d postgres -f backup.sql
```
