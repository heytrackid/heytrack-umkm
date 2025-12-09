# Fitur Update Status Pesanan ✅

## Masalah yang Diperbaiki

### 1. **Penjualan Tidak Terbaca Saat Buat Pesanan**
**Root Cause:** Financial record (penjualan) sekarang dibuat saat order status = `IN_PROGRESS` (produksi).

**Penjelasan:**
- Penjualan tercatat saat mulai produksi, bukan saat delivered
- Inventory juga berkurang saat produksi dimulai
- Workflow yang benar:
  1. Buat order → Status `PENDING` → **Belum ada penjualan**
  2. Ubah status → `CONFIRMED` → **Belum ada penjualan**
  3. Ubah status → `IN_PROGRESS` → **Penjualan tercatat + Stock berkurang** ✅
  4. Ubah status → `READY` → Produk siap
  5. Ubah status → `DELIVERED` → Order selesai

**Kode di API (`src/app/api/orders/[[...slug]]/route.ts`):**
```typescript
// Create income record if DELIVERED
if (orderStatus === 'DELIVERED' && body.total_amount && body.total_amount > 0) {
  const incomeData: FinancialRecordInsert = {
    user_id: user.id,
    type: 'INCOME',
    category: 'Revenue',
    amount: body.total_amount,
    // ...
  }
  // Insert to financial_records table
}
```

### 2. **Tidak Ada Fitur Ubah Status di Halaman Orders**
**Masalah:** Komponen `OrderCard` sudah ada dropdown status, tapi tidak ada handler untuk update.

**Solusi:** Menambahkan fitur lengkap untuk update status pesanan.

## Fitur Baru yang Ditambahkan

### 1. **Status Update Dialog** (`StatusUpdateDialog.tsx`)
- Dialog yang user-friendly untuk ubah status
- Menampilkan status saat ini dan pilihan status berikutnya
- Validasi status transition berdasarkan `ORDER_STATUS_CONFIG`
- Loading state saat update
- Deskripsi untuk setiap status

### 2. **Custom Action di SharedDataTable**
- Tombol "Ubah Status" di dropdown actions
- Hanya muncul jika ada status berikutnya yang valid
- Terintegrasi dengan `StatusUpdateDialog`

### 3. **Handler Update Status**
- `handleOpenStatusDialog()` - Buka dialog dengan data order
- `handleUpdateStatus()` - Kirim request ke API untuk update status
- Auto-refresh data setelah update berhasil
- Error handling dengan alert

## Cara Menggunakan

### Di Halaman Orders (List View)
1. Buka halaman **Orders** → Tab **"Daftar Pesanan"**
2. Klik icon **⋮** (More) di baris pesanan
3. Pilih **"Ubah Status"**
4. Dialog akan muncul dengan pilihan status berikutnya
5. Pilih status baru dan klik **"Ubah Status"**
6. Status akan diupdate dan data akan refresh otomatis

### Status Transition Flow
Berdasarkan `ORDER_STATUS_CONFIG`:

```
PENDING → [CONFIRMED, CANCELLED]
CONFIRMED → [IN_PROGRESS, CANCELLED]
IN_PROGRESS → [READY, CANCELLED]
READY → [DELIVERED]
DELIVERED → [] (final status)
CANCELLED → [] (final status)
```

### Kapan Penjualan Tercatat?
**Penjualan (financial record) tercatat saat:**
- Status diubah ke `DELIVERED` (via PUT `/api/orders/[id]`)
- Atau langsung buat order dengan status `DELIVERED` (via POST `/api/orders`)

**Kode di API:**
```typescript
// If changing TO DELIVERED - create income record
if (newStatus === 'DELIVERED' && !currentOrder.financial_record_id) {
  await financialService.createIncomeFromOrder(
    orderId,
    currentOrder.order_no,
    body?.total_amount ?? currentOrder.total_amount ?? 0,
    // ...
  )
}
```

## Rekomendasi Tabel

### **SharedDataTable** ✅ (Untuk Halaman Utama)
**Gunakan untuk:**
- Halaman Orders, Recipes, Ingredients, Customers, Suppliers
- Butuh fitur lengkap: search, filter, pagination, bulk actions, export
- Data < 1000 rows
- Server-side pagination
- Card view mode
- Custom actions per row

**Fitur:**
- ✅ Search & filter
- ✅ Pagination (client & server)
- ✅ Bulk actions
- ✅ Export CSV
- ✅ Custom actions
- ✅ Card/Table view toggle
- ✅ Responsive mobile

### **VirtualizedTable** ✅ (Untuk Data Besar)
**Gunakan untuk:**
- Data sangat besar (> 1000 rows)
- Nested tables (order items di detail order)
- Simple display tanpa filter/search
- Real-time data yang sering update

**Fitur:**
- ✅ Virtual scrolling (performance)
- ✅ Simple & lightweight
- ❌ No search/filter
- ❌ No pagination

## Files Modified

1. **`src/modules/orders/components/OrdersPage.tsx`**
   - Added `handleOpenStatusDialog()`
   - Added `handleUpdateStatus()`
   - Added `StatusUpdateDialog` component
   - Added custom action "Ubah Status" to SharedDataTable

2. **`src/modules/orders/components/StatusUpdateDialog.tsx`** (NEW)
   - Dialog component untuk update status
   - Radio group untuk pilih status baru
   - Validasi dan loading state

## Testing Checklist

- [ ] Buka halaman Orders
- [ ] Buat pesanan baru dengan status PENDING
- [ ] Cek dashboard - penjualan belum tercatat
- [ ] Ubah status ke CONFIRMED
- [ ] Cek dashboard - penjualan masih belum tercatat
- [ ] Ubah status ke IN_PROGRESS
- [ ] Ubah status ke READY
- [ ] Ubah status ke DELIVERED
- [ ] Cek dashboard - **penjualan sudah tercatat** ✅
- [ ] Cek financial records - ada record INCOME baru

## Next Steps (Optional)

1. **Toast Notifications** - Ganti `alert()` dengan toast notification yang lebih bagus
2. **Confirmation Dialog** - Tambah konfirmasi untuk status kritis (CANCELLED, DELIVERED)
3. **Status History** - Track history perubahan status
4. **Bulk Status Update** - Update status multiple orders sekaligus
5. **WhatsApp Notification** - Auto-send WhatsApp saat status berubah
