# Report: Fitur yang Tidak Ada Tabel di Supabase

## ✅ Tabel yang Ada di Supabase (37 tabel)

### Core Tables
- ✅ `user_profiles` - User management
- ✅ `app_settings` - App configuration
- ✅ `user_onboarding` - Onboarding wizard

### Inventory & Ingredients
- ✅ `ingredients` - Bahan baku
- ✅ `ingredient_purchases` - Pembelian bahan
- ✅ `stock_transactions` - Transaksi stok
- ✅ `stock_reservations` - Reservasi stok
- ✅ `inventory_alerts` - Alert inventory
- ✅ `inventory_reorder_rules` - Aturan reorder
- ✅ `inventory_stock_logs` - Log perubahan stok
- ✅ `usage_analytics` - Analitik penggunaan

### Recipes
- ✅ `recipes` - Resep produk
- ✅ `recipe_ingredients` - Komposisi resep

### Orders & Customers
- ✅ `customers` - Data pelanggan
- ✅ `orders` - Pesanan
- ✅ `order_items` - Item pesanan
- ✅ `payments` - Pembayaran

### Production
- ✅ `productions` - Batch produksi
- ✅ `production_batches` - Batch produksi (duplikat?)
- ✅ `production_schedules` - Jadwal produksi

### Finance
- ✅ `financial_records` - Catatan keuangan
- ✅ `operational_costs` - Biaya operasional

### HPP (Cost Calculation)
- ✅ `hpp_calculations` - Kalkulasi HPP
- ✅ `hpp_history` - Riwayat HPP
- ✅ `hpp_alerts` - Alert HPP
- ✅ `hpp_recommendations` - Rekomendasi HPP

### Notifications
- ✅ `notifications` - Notifikasi
- ✅ `notification_preferences` - Preferensi notifikasi

### Suppliers
- ✅ `suppliers` - Data supplier
- ✅ `supplier_ingredients` - Harga supplier per ingredient

### Communications
- ✅ `whatsapp_templates` - Template WhatsApp

### Analytics & Reports
- ✅ `daily_sales_summary` - Ringkasan penjualan harian

### System
- ✅ `error_logs` - Log error
- ✅ `performance_logs` - Log performa

### AI Chatbot
- ✅ `chat_sessions` - Sesi chat
- ✅ `chat_messages` - Pesan chat
- ✅ `chat_context_cache` - Cache context
- ✅ `conversation_sessions` - Sesi percakapan (duplikat?)
- ✅ `conversation_history` - Riwayat percakapan (duplikat?)

---

## ❌ FITUR YANG TIDAK ADA TABELNYA

### 1. `/app/profit` - Profit Analysis
**Status**: ❌ **TIDAK ADA TABEL KHUSUS**

**Tabel yang dibutuhkan tapi tidak ada**:
- Tidak ada tabel `profit_analysis` atau `profit_reports`
- Kemungkinan menggunakan query agregasi dari:
  - `orders` (revenue)
  - `operational_costs` (expenses)
  - `hpp_calculations` (cost)

**Rekomendasi**: 
- ✅ **KEEP** - Fitur ini menggunakan data dari tabel existing
- Profit = Revenue (orders) - Costs (operational_costs + hpp)
- Tidak perlu tabel khusus

---

### 2. `/app/inventory` vs `/app/ingredients`
**Status**: ⚠️ **DUPLIKASI ROUTE**

**Analisis**:
- `/app/ingredients` → Tabel `ingredients` ✅
- `/app/inventory` → Tabel `ingredients` juga ✅

**Rekomendasi**:
- ❌ **HAPUS `/app/inventory`** atau merge dengan `/app/ingredients`
- Kedua route ini mengakses tabel yang sama
- Pilih satu: gunakan `/app/ingredients` saja

---

### 3. `/app/reports` - Reporting
**Status**: ✅ **MENGGUNAKAN TABEL EXISTING**

**Tabel yang digunakan**:
- `daily_sales_summary` ✅
- Query agregasi dari tabel lain

**Rekomendasi**: ✅ **KEEP**

---

### 4. `/app/finance` - Finance Management
**Status**: ✅ **ADA TABEL**

**Tabel**:
- `financial_records` ✅
- `operational_costs` ✅

**Rekomendasi**: ✅ **KEEP**

---

## 🔍 TABEL DUPLIKAT DI SUPABASE

### 1. Production Tables - DUPLIKAT
- `productions` ✅
- `production_batches` ✅ (DUPLIKAT?)

**Rekomendasi**: 
- Cek apakah kedua tabel ini digunakan
- Jika sama, hapus salah satu
- Jika berbeda, rename untuk clarity

### 2. Chat/Conversation Tables - DUPLIKAT
- `chat_sessions` ✅
- `conversation_sessions` ✅ (DUPLIKAT?)
- `chat_messages` ✅
- `conversation_history` ✅ (DUPLIKAT?)

**Rekomendasi**:
- ❌ **HAPUS `conversation_sessions`** - gunakan `chat_sessions`
- ❌ **HAPUS `conversation_history`** - gunakan `chat_messages`

---

## 📋 ACTION PLAN

### Priority 1: Hapus Route Duplikat
```bash
# Hapus inventory route (gunakan ingredients saja)
rm -rf src/app/inventory
```

### Priority 2: Cleanup Tabel Duplikat di Supabase
```sql
-- Backup dulu sebelum hapus!

-- 1. Cek apakah conversation_sessions digunakan
SELECT COUNT(*) FROM conversation_sessions;

-- 2. Cek apakah conversation_history digunakan
SELECT COUNT(*) FROM conversation_history;

-- 3. Jika tidak ada data atau tidak digunakan, hapus
DROP TABLE IF EXISTS conversation_sessions;
DROP TABLE IF EXISTS conversation_history;

-- 4. Cek production_batches vs productions
-- Lihat mana yang lebih lengkap dan digunakan
```

### Priority 3: Update Code References
```bash
# Find semua reference ke inventory route
grep -r "\/inventory" src/

# Find semua reference ke conversation tables
grep -r "conversation_sessions\|conversation_history" src/
```

---

## 📊 SUMMARY

| Kategori | Status | Action |
|----------|--------|--------|
| `/app/profit` | ✅ Keep | Menggunakan agregasi dari tabel existing |
| `/app/inventory` | ❌ Hapus | Duplikat dengan `/app/ingredients` |
| `/app/reports` | ✅ Keep | Menggunakan `daily_sales_summary` |
| `/app/finance` | ✅ Keep | Ada tabel `financial_records` |
| `conversation_sessions` | ❌ Hapus | Duplikat dengan `chat_sessions` |
| `conversation_history` | ❌ Hapus | Duplikat dengan `chat_messages` |
| `production_batches` | ⚠️ Review | Cek apakah duplikat dengan `productions` |

---

## ✅ KESIMPULAN

**Fitur yang TIDAK perlu dihapus**:
- Semua fitur di `/app/*` sudah punya tabel atau menggunakan agregasi
- Tidak ada fitur "orphan" yang benar-benar tidak ada datanya

**Yang perlu dihapus**:
1. ❌ Route `/app/inventory` (duplikat dengan `/app/ingredients`)
2. ❌ Tabel `conversation_sessions` (duplikat dengan `chat_sessions`)
3. ❌ Tabel `conversation_history` (duplikat dengan `chat_messages`)
4. ⚠️ Review `production_batches` vs `productions`

**Total Savings**:
- 1 route folder dihapus
- 2-3 tabel database dihapus
- Simplified codebase
