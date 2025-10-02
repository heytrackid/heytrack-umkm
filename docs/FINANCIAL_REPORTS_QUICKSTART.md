# 🚀 Quick Start - Laporan Keuangan

Panduan cepat untuk menggunakan fitur Laporan Keuangan di Bakery Management System.

---

## 📍 Cara Mengakses

### Dari Menu Navigasi
1. Buka aplikasi di browser: `http://localhost:3000`
2. Lihat menu sidebar bagian **"Monitoring"**
3. Pilih salah satu:
   - **"Arus Kas"** - untuk melihat arus kas masuk & keluar
   - **"Laba Riil"** - untuk melihat laporan laba rugi dengan WAC

### URL Langsung
- Arus Kas: `http://localhost:3000/cash-flow`
- Laba Riil: `http://localhost:3000/profit`

---

## 💰 Laporan Arus Kas

### Apa yang Ditampilkan?
- 💵 Total Pemasukan (dari pesanan yang sudah dibayar)
- 💸 Total Pengeluaran (biaya operasional)
- 📊 Arus Kas Bersih (selisih masuk-keluar)
- 📈 Tren per periode
- 📋 Daftar transaksi detail

### Cara Filter Periode
1. Klik dropdown **"Periode"**
2. Pilih:
   - **Minggu Ini** - 7 hari terakhir
   - **Bulan Ini** - bulan berjalan
   - **Tahun Ini** - tahun berjalan

### Cara Ekspor Data
1. Klik tombol **"Ekspor CSV"** atau **"Ekspor Excel"**
2. File akan otomatis terunduh
3. Buka dengan Excel/Google Sheets

---

## 📈 Laporan Laba Riil

### Apa yang Ditampilkan?
- 💰 Total Pendapatan
- 🥖 Harga Pokok Penjualan (HPP) dengan metode WAC
- ✅ Laba Kotor & Margin
- 💵 Laba Bersih & Margin
- 📊 Profitabilitas per Produk
- 🧾 Rincian Biaya Bahan Baku
- 💸 Biaya Operasional

### Cara Filter Periode
1. Klik dropdown **"Periode"**
2. Pilih:
   - **Minggu Ini**
   - **Bulan Ini**
   - **Kuartal Ini**
   - **Tahun Ini**
   - **Kustom** - pilih tanggal sendiri

### Untuk Filter Kustom:
1. Pilih **"Kustom"** di dropdown
2. Masukkan **Tanggal Mulai**
3. Masukkan **Tanggal Akhir**
4. Klik **"Terapkan Filter"**

### Cara Baca Laporan

#### 1. Kartu Ringkasan (Atas)
- **Total Pendapatan**: Jumlah uang masuk dari penjualan
- **Laba Kotor**: Pendapatan dikurangi HPP
- **Laba Bersih**: Laba setelah semua biaya
- **HPP**: Biaya produksi menggunakan WAC

#### 2. Tabel Profitabilitas Produk
Menampilkan per produk:
- Jumlah terjual
- Pendapatan
- HPP (biaya produksi)
- Laba
- Margin keuntungan (%)

**Warna Badge:**
- 🟢 **Default** - Margin ≥ 30% (Bagus!)
- ⚪ **Secondary** - Margin < 30% (Perlu perhatian)

#### 3. Tabel Biaya Bahan Baku
Menampilkan:
- Nama bahan baku
- Jumlah terpakai
- Harga WAC (rata-rata tertimbang)
- Total biaya

#### 4. Ringkasan Laba Rugi
Perhitungan lengkap:
```
Pendapatan:           Rp 50.000.000
- HPP (WAC):          Rp 20.000.000
= Laba Kotor:         Rp 30.000.000 (60%)
- Biaya Operasional:  Rp 10.000.000
= Laba Bersih:        Rp 20.000.000 (40%)
```

---

## 🎯 Tips & Best Practices

### Untuk Akurasi Data
1. ✅ Pastikan semua pesanan punya `delivery_date`
2. ✅ Catat semua biaya operasional di menu Expenses
3. ✅ Update harga beli bahan baku secara rutin
4. ✅ Tandai pesanan sebagai "delivered" setelah dikirim

### Membaca Tren
- 📈 **Panah Naik Hijau** = Pertumbuhan positif
- 📉 **Panah Turun Merah** = Penurunan
- **Persentase** = Besar perubahan vs periode sebelumnya

### Margin Keuntungan Sehat
- 🟢 **Sangat Baik**: Margin > 40%
- 🟡 **Baik**: Margin 30-40%
- 🟠 **Cukup**: Margin 20-30%
- 🔴 **Perlu Perbaikan**: Margin < 20%

---

## ❓ FAQ

### Q: Mengapa data saya kosong?
**A**: Pastikan Anda sudah:
- Memasukkan data pesanan
- Menandai status pembayaran
- Mencatat biaya operasional
- Filter periode sudah benar

### Q: Apa itu WAC?
**A**: WAC (Weighted Average Cost) adalah metode perhitungan HPP yang:
- Menghitung rata-rata harga beli bahan baku
- Lebih akurat dari FIFO/LIFO
- Cocok untuk bisnis bakery

### Q: Kapan sebaiknya cek laporan?
**A**: Disarankan:
- **Harian**: Cek arus kas
- **Mingguan**: Review performa produk
- **Bulanan**: Analisis laba rugi lengkap
- **Kuartalan**: Evaluasi strategi bisnis

### Q: Format ekspor apa yang tersedia?
**A**: Saat ini:
- ✅ CSV (universal, buka di Excel/Sheets)
- ✅ Excel (.xlsx)
- ⏳ PDF (akan datang)

### Q: Bagaimana menghitung margin keuntungan?
**A**: 
```
Margin (%) = (Laba / Pendapatan) × 100

Contoh:
Pendapatan = Rp 100.000
Laba = Rp 30.000
Margin = (30.000 / 100.000) × 100 = 30%
```

---

## 🐛 Troubleshooting

### Laporan Loading Lama
1. Kurangi rentang tanggal
2. Refresh browser (F5)
3. Cek koneksi internet

### Data Tidak Akurat
1. Periksa tanggal pengiriman pesanan
2. Verifikasi status pembayaran
3. Pastikan tidak ada duplikasi data

### Error Saat Ekspor
1. Coba format lain (CSV/Excel)
2. Pastikan ada data di periode tersebut
3. Refresh halaman dan coba lagi

---

## 📞 Butuh Bantuan?

1. 📖 Baca [Dokumentasi Lengkap](./FINANCIAL_REPORTS.md)
2. 🧪 Lihat [Panduan Testing](./FINANCIAL_REPORTS_TESTING.md)
3. 💬 Hubungi tim developer

---

## 🎓 Video Tutorial

_(Akan segera ditambahkan)_

- [ ] Cara mengakses laporan
- [ ] Membaca laporan arus kas
- [ ] Analisis laporan laba rugi
- [ ] Ekspor dan cetak laporan

---

**Happy Reporting! 🎉**

Untuk dokumentasi teknis lebih lengkap, lihat [FINANCIAL_REPORTS.md](./FINANCIAL_REPORTS.md)
