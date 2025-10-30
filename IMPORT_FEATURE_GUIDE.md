# Panduan Fitur Import

## Overview

Fitur import memungkinkan user untuk menambahkan data secara massal menggunakan file CSV. Tersedia untuk:
1. **Bahan Baku** - Import ingredients dengan stok dan harga
2. **Pesanan** - Import orders dengan auto-create customers

## Cara Menggunakan

### Import Bahan Baku

1. Buka halaman **Bahan Baku** (`/ingredients`)
2. Klik tombol **Import**
3. Download template CSV
4. Isi data bahan baku di template:
   - `name` - Nama bahan (wajib)
   - `unit` - Satuan (kg, gram, liter, dll) (wajib)
   - `price_per_unit` - Harga per satuan (wajib)
   - `current_stock` - Stok saat ini (opsional, default: 0)
   - `min_stock` - Stok minimum (opsional, default: 0)
   - `category` - Kategori (opsional, default: General)
   - `supplier` - Nama supplier (opsional)
   - `description` - Deskripsi (opsional)
5. Simpan file sebagai CSV
6. Upload file dan klik **Import**

**Contoh Data:**
```csv
name,unit,price_per_unit,current_stock,min_stock,category,supplier,description
Tepung Terigu,kg,12000,50,10,Bahan Pokok,Toko Bahan Kue,Tepung terigu protein sedang
Gula Pasir,kg,15000,30,5,Bahan Pokok,Toko Sembako,Gula pasir putih
Telur,butir,2500,100,20,Protein,Pasar Tradisional,Telur ayam negeri
Mentega,kg,45000,10,3,Dairy,Toko Bahan Kue,Mentega tawar untuk kue
Coklat Bubuk,kg,85000,5,2,Bahan Pokok,Supplier Coklat,Coklat bubuk premium
```

**Catatan Format:**
- Jika ada koma dalam data (misalnya alamat), bungkus dengan tanda kutip: `"Jl. Merdeka No. 123, Jakarta"`
- Kolom akan otomatis terpisah dengan benar
- Gunakan Excel atau Google Sheets untuk edit, lalu Save As CSV

### Import Pesanan

1. Buka halaman **Pesanan** (`/orders`)
2. Klik tombol **Import**
3. Download template CSV
4. Isi data pesanan di template:
   - `order_no` - Nomor pesanan (wajib, harus unik)
   - `customer_name` - Nama customer (wajib)
   - `customer_phone` - Telepon customer (opsional)
   - `customer_email` - Email customer (opsional)
   - `customer_address` - Alamat customer (opsional)
   - `recipe_name` - Nama resep (wajib, harus sudah ada)
   - `quantity` - Jumlah pesanan (wajib)
   - `unit_price` - Harga per unit (wajib)
   - `delivery_date` - Tanggal kirim (opsional, format: YYYY-MM-DD)
   - `notes` - Catatan (opsional)
   - `status` - Status pesanan (opsional, default: PENDING)
5. Simpan file sebagai CSV
6. Upload file dan klik **Import**

**Contoh Data:**
```csv
order_no,customer_name,customer_phone,customer_email,customer_address,recipe_name,quantity,unit_price,delivery_date,notes,status
ORD-001,Budi Santoso,081234567890,budi@email.com,"Jl. Merdeka No. 123, Jakarta",Kue Brownies,10,50000,2025-11-01,Pesanan untuk acara ulang tahun,PENDING
ORD-002,Siti Aminah,081298765432,siti@email.com,"Jl. Sudirman No. 45, Bandung",Kue Lapis,5,75000,2025-11-02,Kemasan premium,CONFIRMED
ORD-003,Ahmad Yani,081234567899,ahmad@email.com,"Jl. Gatot Subroto No. 88, Surabaya",Kue Brownies,20,50000,2025-11-03,Untuk kantor,PENDING
```

**Catatan Format:**
- Alamat yang mengandung koma harus dibungkus dengan tanda kutip: `"Jl. Merdeka No. 123, Jakarta"`
- Kolom akan otomatis terpisah dengan benar
- Gunakan Excel atau Google Sheets untuk edit, lalu Save As CSV
- Pastikan encoding UTF-8 untuk karakter Indonesia

## Fitur Khusus

### Auto-Create Customer

Saat import pesanan, jika customer dengan nama yang sama belum ada, sistem akan otomatis membuat customer baru dengan data:
- Nama dari `customer_name`
- Telepon dari `customer_phone`
- Email dari `customer_email`
- Alamat dari `customer_address`

Jika customer sudah ada (berdasarkan nama), pesanan akan di-link ke customer yang sudah ada.

### Validasi Data

Sistem akan memvalidasi data sebelum import:

**Bahan Baku:**
- ✅ Nama wajib diisi
- ✅ Satuan wajib diisi
- ✅ Harga harus angka positif
- ✅ Stok harus angka (boleh 0)

**Pesanan:**
- ✅ Nomor pesanan wajib diisi dan unik
- ✅ Nama customer wajib diisi
- ✅ Nama resep wajib diisi dan harus sudah ada di database
- ✅ Jumlah harus angka positif
- ✅ Harga harus angka positif

Jika ada error validasi, sistem akan menampilkan detail error per baris.

## Status Pesanan

Status yang valid untuk import pesanan:
- `PENDING` - Menunggu konfirmasi (default)
- `CONFIRMED` - Sudah dikonfirmasi
- `IN_PROGRESS` - Sedang diproses
- `READY` - Siap dikirim
- `DELIVERED` - Sudah dikirim
- `CANCELLED` - Dibatalkan

## Format CSV yang Benar

### Aturan Dasar
1. **Baris pertama adalah header** - Jangan dihapus atau diubah
2. **Setiap kolom dipisahkan dengan koma (,)**
3. **Data yang mengandung koma harus dibungkus dengan tanda kutip (")**
   - Contoh: `"Jl. Merdeka No. 123, Jakarta"`
4. **Tanda kutip dalam data harus di-escape dengan tanda kutip ganda ("")**
   - Contoh: `"Deskripsi dengan ""kutip"" di dalamnya"`

### Cara Edit CSV
1. **Menggunakan Excel/Google Sheets (Recommended)**
   - Buka template dengan Excel atau Google Sheets
   - Edit data seperti biasa
   - Save As → CSV (Comma delimited)
   - Excel akan otomatis handle format yang benar

2. **Menggunakan Text Editor**
   - Buka dengan Notepad/VS Code
   - Pastikan format sesuai aturan di atas
   - Simpan dengan encoding UTF-8

### Contoh Format yang Benar

**✅ BENAR:**
```csv
name,address,description
Tepung Terigu,"Jl. Merdeka No. 123, Jakarta",Tepung protein sedang
Gula Pasir,Jl. Sudirman No. 45,Gula putih
```

**❌ SALAH:**
```csv
name,address,description
Tepung Terigu,Jl. Merdeka No. 123, Jakarta,Tepung protein sedang
```
(Alamat tidak dibungkus kutip, koma akan dianggap pemisah kolom)

## Tips

1. **Gunakan Template** - Selalu download template untuk memastikan format yang benar
2. **Edit dengan Excel/Sheets** - Lebih mudah dan otomatis handle format
3. **Cek Resep** - Pastikan resep sudah dibuat sebelum import pesanan
4. **Format Tanggal** - Gunakan format YYYY-MM-DD (contoh: 2025-11-01)
5. **Nomor Unik** - Pastikan nomor pesanan tidak duplikat
6. **Encoding UTF-8** - Simpan file CSV dengan encoding UTF-8 untuk karakter Indonesia
7. **Test dengan Data Kecil** - Coba import 2-3 baris dulu sebelum import banyak data

## Troubleshooting

### Error: "Resep tidak ditemukan"
- Pastikan nama resep di CSV sama persis dengan nama di database
- Buat resep terlebih dahulu sebelum import pesanan

### Error: "Nomor pesanan sudah ada"
- Gunakan nomor pesanan yang unik
- Cek pesanan yang sudah ada di database

### Error: "File CSV kosong"
- Pastikan file memiliki header dan minimal 1 baris data
- Jangan hapus baris header

### Error: "Harga harus angka positif"
- Gunakan angka tanpa titik ribuan
- Contoh: 50000 (bukan 50.000)

## Technical Details

### API Endpoints

**Import Bahan Baku:**
```
POST /api/ingredients/import
Body: { ingredients: Array<IngredientData> }
```

**Import Pesanan:**
```
POST /api/orders/import
Body: { orders: Array<OrderData> }
```

### Files

- API Routes:
  - `src/app/api/ingredients/import/route.ts`
  - `src/app/api/orders/import/route.ts`
- Components:
  - `src/components/import/ImportDialog.tsx`
  - `src/components/import/csv-helpers.ts`
- Pages:
  - `src/app/ingredients/page.tsx` (with import button)
  - `src/app/orders/page.tsx` (with import button)

---

**Last Updated:** October 30, 2025
