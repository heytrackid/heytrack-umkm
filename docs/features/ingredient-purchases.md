# Fitur Pembelian Bahan Baku (Ingredient Purchases)

## Overview
Fitur pembelian bahan baku memungkinkan pengguna untuk mencatat setiap pembelian bahan baku, yang secara otomatis akan:
- Update stok bahan baku (menambah current_stock)
- Update harga rata-rata tertimbang (Weighted Average Cost)
- Mencatat riwayat pembelian untuk analisis

## Akses Fitur
- **URL**: `/ingredients/purchases`
- **Navigasi**: Dashboard → Bahan Baku → Tombol "Pembelian"

## Fitur Utama

### 1. Form Pembelian
- **Bahan Baku**: Pilih dari daftar bahan yang sudah ada
- **Jumlah**: Quantity yang dibeli (dengan satuan otomatis dari bahan)
- **Harga Satuan**: Harga per unit
- **Total**: Dihitung otomatis (quantity × unit_price)
- **Supplier**: Nama supplier (opsional)
- **Tanggal Pembelian**: Default hari ini
- **Catatan**: Catatan tambahan (opsional)

### 2. Statistik Pembelian
Menampilkan 4 kartu statistik:
- **Pembelian Bulan Ini**: Total transaksi pembelian
- **Pengeluaran Bulan Ini**: Total nilai pembelian
- **Supplier Aktif**: Jumlah supplier unik
- **Rata-rata Pembelian**: Nilai rata-rata per transaksi

### 3. Tabel Riwayat Pembelian
Menampilkan semua pembelian dengan kolom:
- Tanggal pembelian
- Nama bahan baku
- Supplier
- Jumlah (dengan satuan)
- Harga satuan
- Total harga

## Database Schema

```sql
CREATE TABLE ingredient_purchases (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  purchase_date DATE DEFAULT CURRENT_DATE,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  supplier TEXT,
  notes TEXT,
  expense_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### GET `/api/ingredient-purchases`
List semua pembelian dengan filter opsional:
- `ingredient_id`: Filter by bahan baku
- `supplier_id`: Filter by supplier
- `start_date`: Filter tanggal mulai
- `end_date`: Filter tanggal akhir

### POST `/api/ingredient-purchases`
Buat pembelian baru. Body:
```json
{
  "ingredient_id": "uuid",
  "quantity": 100,
  "unit_price": 5000,
  "supplier": "Supplier Name",
  "purchase_date": "2024-01-01",
  "notes": "Optional notes"
}
```

### GET `/api/ingredient-purchases/:id`
Get detail pembelian by ID

### PUT `/api/ingredient-purchases/:id`
Update pembelian. Body sama seperti POST (semua field opsional)

### DELETE `/api/ingredient-purchases/:id`
Hapus pembelian

### GET `/api/ingredient-purchases/stats`
Get statistik pembelian dengan filter tanggal opsional

### GET `/api/ingredients/:id/purchase-history`
Get riwayat pembelian untuk bahan baku tertentu

## Automasi

### Update Stok Otomatis
Ketika pembelian dibuat, trigger database akan:
1. Menambah `current_stock` pada tabel `ingredients`
2. Update `price_per_unit` menggunakan weighted average cost (WAC)

Formula WAC:
```
new_price = (old_stock × old_price + new_quantity × new_price) / (old_stock + new_quantity)
```

### Revert Stok saat Hapus
Ketika pembelian dihapus, trigger akan mengurangi stok sesuai quantity yang dihapus.

## Hooks & Services

### Custom Hooks
- `useIngredientPurchases()`: Get all purchases dengan filter
- `useIngredientPurchase(id)`: Get single purchase
- `useCreateIngredientPurchase()`: Create mutation
- `useUpdateIngredientPurchase()`: Update mutation
- `useDeleteIngredientPurchase()`: Delete mutation
- `usePurchaseStats()`: Get statistics
- `useIngredientPurchaseHistory(ingredientId)`: Get history per ingredient

## Komponen

### PurchaseForm
Dialog form untuk input pembelian baru dengan validasi:
- Required: ingredient_id, quantity, unit_price
- Optional: supplier, purchase_date, notes
- Auto-calculate total price
- Real-time validation dengan Zod

### PurchasesTable
Tabel riwayat pembelian dengan:
- Sorting by purchase_date (descending)
- Display ingredient name & unit
- Formatted currency (Rp)
- Notes display

### PurchaseStats
4 kartu statistik dengan icons dan colors:
- Shopping cart icon untuk total pembelian
- Dollar icon untuk pengeluaran
- Package icon untuk supplier
- Trending up icon untuk rata-rata

## Integrasi

### Dengan Ingredients
- Auto-update stok dan harga
- Link ke detail ingredient
- Filter by ingredient

### Dengan Suppliers (Future)
- Link ke supplier records
- Supplier performance tracking
- Price comparison

### Dengan Cash Flow (Future)
- Auto-create expense record
- Link via expense_id field
- Financial reporting integration

## Best Practices

1. **Selalu isi supplier**: Untuk tracking dan analisis
2. **Cek harga sebelum input**: Pastikan harga satuan benar
3. **Tambahkan notes**: Untuk informasi tambahan (no. invoice, dll)
4. **Review statistik**: Monitor trend pembelian dan pengeluaran
5. **Backup data**: Export riwayat pembelian secara berkala

## Troubleshooting

### Stok tidak update
- Cek trigger database `update_wac_on_purchase` aktif
- Pastikan ingredient_id valid
- Cek RLS policies

### Error saat create
- Pastikan user authenticated
- Cek validasi form (quantity > 0, unit_price >= 0)
- Pastikan ingredient exists

### Data tidak muncul
- Cek filter tanggal
- Pastikan user_id match
- Refresh page atau invalidate query
