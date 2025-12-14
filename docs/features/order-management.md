# Order Management (Pesanan)

Dokumen ini menjelaskan alur dan implementasi fitur **Order/Pesanan** di HeyTrack, termasuk:
- Alur status pesanan
- Pembuatan pesanan (POST)
- Update pesanan (PUT) termasuk **pembayaran**
- Sinkronisasi inventory dan financial record
- UX pembayaran (Parsial/Lunas) di List & Detail
- Follow Up WhatsApp
- Auto-refresh UI (React Query cache invalidation)

## 1. Konsep Data Utama

### Tabel penting
- **orders**: data utama pesanan
- **order_items**: item resep/produk per pesanan
- **financial_records**: pencatatan pemasukan dari pesanan
- **inventory** (melalui RPC): reservasi / pengurangan stok untuk item order

### Field penting di `orders`
- **status**: PENDING | CONFIRMED | IN_PROGRESS | READY | DELIVERED | CANCELLED
- **total_amount**: total tagihan pesanan
- **paid_amount**: jumlah yang sudah dibayar
- **payment_status**: UNPAID | PARTIAL | PAID
- **payment_method**: metode pembayaran (lihat constants)

## 2. Status Pesanan & Aturan Transisi

Sumber kebenaran: `src/lib/shared/constants.ts` → `VALID_ORDER_STATUS_TRANSITIONS`.

Alur umum:
- PENDING → CONFIRMED → IN_PROGRESS → READY → DELIVERED
- CANCELLED adalah terminal state

Catatan:
- Transisi **CONFIRMED → PENDING** juga diizinkan (untuk kasus user “balikin” status).
- Transisi final (DELIVERED / CANCELLED) tidak boleh pindah status lagi.

## 3. API Orders

### 3.1 GET `/api/orders`
Mengambil daftar orders (untuk list view) dengan caching.

### 3.2 POST `/api/orders`
File: `src/app/api/orders/[[...slug]]/route.ts`

Ringkasan:
- Body divalidasi menggunakan `OrderWithItemsInsertSchema`.
- `items` **tidak** disimpan di kolom `orders` (karena tidak ada kolom `items`).
- Flow:
  1. Ambil `items` dari body.
  2. (Jika ada items) reservasi stok via RPC `reserve_stock_for_order`.
  3. Insert ke `orders` (tanpa `items`).
  4. Insert ke `order_items`.
  5. Invalidate cache orders agar UI langsung update.

### 3.3 PUT `/api/orders/[id]`
File: `src/app/api/orders/[[...slug]]/route.ts`

Ringkasan:
- Body divalidasi dengan `OrderUpdateSchema` (partial update).
- Sebelum update:
  - Load `currentOrder` (status, total, paid, payment_method, dsb).
  - Validasi transisi status menggunakan `VALID_ORDER_STATUS_TRANSITIONS`.

#### Payment Status Derivation (Single Source of Truth)
Agar user tidak bingung dan data konsisten, `payment_status` **di-derive otomatis**:
- Jika `paid_amount >= total_amount` → `payment_status = 'PAID'`
- Jika `0 < paid_amount < total_amount` → `payment_status = 'PARTIAL'`
- Jika `paid_amount = 0` → `payment_status = 'UNPAID'`

Aturan enforcement:
- Jika request membawa field pembayaran (`paid_amount`, `payment_status`, `total_amount`), backend akan:
  - Set `payment_status` berdasarkan aturan di atas
  - Menjaga `payment_method` lama jika tidak dikirim

#### Sinkronisasi Financial & Inventory
- Ketika status berubah ke state tertentu, sistem melakukan:
  - Create income record saat memenuhi syarat (bergantung implementasi service)
  - Deduct/release stock via RPC sesuai perubahan status/cancellation

> Catatan: Detail sinkronisasi financial/inventory bergantung service yang dipanggil di route.

## 4. UX Pembayaran (List + Detail)

### 4.1 Orders List (OrdersPage)
File: `src/modules/orders/components/OrdersPage.tsx`

Fitur:
- Quick actions per order:
  - **Catat Pembayaran** (modal) → input nominal & metode
  - **Tandai Lunas** → set `paid_amount = total_amount`

Modal pembayaran:
- Menampilkan: Total, Sudah dibayar, Sisa
- Input: Nominal diterima
- Select: Metode pembayaran (dari `PAYMENT_METHODS`)

### 4.2 Order Detail (OrderDetailView)
File: `src/modules/orders/components/OrderDetailView.tsx`

Fitur:
- Tab **Bayar** menampilkan ringkasan
- Tombol:
  - Catat Pembayaran (modal)
  - Tandai Lunas

Detail view pakai `currentOrder` local state agar UI langsung reflect update.

## 5. Follow Up WhatsApp

File:
- UI Follow Up: `src/modules/orders/components/OrdersPage.tsx`
- Komponen: `src/components/orders/WhatsAppFollowUp.tsx`

Alur:
- Tombol **Follow Up** di header (sebelah Pesanan Baru).
- Dialog memungkinkan memilih order yang punya `customer_phone`.
- Render `WhatsAppFollowUp` untuk generate & kirim/copy pesan.

Catatan teknis (strict optional types):
- Dengan `exactOptionalPropertyTypes`, field optional seperti `delivery_date` dan `notes` tidak boleh dikirim sebagai `undefined`.
- Implementasi followup meng-*omit* field itu jika kosong.

## 6. Auto Refresh UI (TanStack Query)

Sumber hooks: `src/hooks/api/useOrders.ts`

Prinsip:
- Setelah create/update/delete order → invalidate queries:
  - `['orders']`
  - `['orders-list']`
  - (untuk detail) `['order', id]`

Dengan ini, UI tidak butuh refresh manual.

## 7. Checklist Testing (Manual)

- Buat order baru (dengan items)
  - Pastikan muncul di list tanpa refresh
- Update status order via action “Ubah Status”
  - Pastikan list update tanpa refresh
  - Pastikan transisi invalid ditolak dengan error
- Payment:
  - Catat pembayaran parsial → payment_status jadi PARTIAL
  - Tandai lunas → payment_status jadi PAID dan paid_amount = total
- Follow Up:
  - Klik Follow Up
  - Pilih order yang punya customer_phone
  - Pastikan template/pesan bisa digenerate
