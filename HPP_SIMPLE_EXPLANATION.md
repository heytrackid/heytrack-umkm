# HPP (Harga Pokok Produksi) - Penjelasan Sederhana

**Untuk**: User HeyTrack  
**Tujuan**: Memahami bagaimana HPP dihitung

---

## Apa itu HPP?

HPP adalah **total biaya untuk membuat 1 unit produk**.

Contoh: Jika HPP Kue Coklat adalah Rp 12,500, berarti biaya untuk membuat 1 potong kue coklat adalah Rp 12,500.

---

## Komponen HPP

HPP terdiri dari 4 komponen:

### 1. Biaya Bahan Baku (Material Cost)
Biaya semua bahan yang digunakan untuk membuat produk.

**Contoh - Kue Coklat (1 potong)**:
- Tepung: Rp 250
- Coklat: Rp 1,000
- Telur: Rp 200
- Gula: Rp 300
- **Total**: Rp 1,750

### 2. Biaya Tenaga Kerja (Labor Cost)
Biaya gaji/upah untuk membuat produk.

**Contoh**:
- Jika 1 batch (10 potong) membutuhkan 1 jam kerja
- Upah per jam: Rp 50,000
- Biaya per potong: Rp 50,000 / 10 = Rp 5,000

### 3. Biaya Operasional (Overhead Cost)
Biaya untuk menjalankan bisnis (listrik, gas, sewa, dll).

**Contoh**:
- Total biaya operasional per bulan: Rp 10,000,000
- Total produksi per bulan: 2,000 potong
- Biaya per potong: Rp 10,000,000 / 2,000 = Rp 5,000

### 4. Penyesuaian Harga (WAC Adjustment)
Penyesuaian jika harga bahan baku berubah.

**Contoh**:
- Harga coklat kemarin: Rp 50,000/kg
- Harga coklat hari ini: Rp 52,000/kg
- Penyesuaian: Rp 2,000/kg (naik)

---

## Rumus HPP

```
HPP per Unit = Biaya Bahan + Biaya Tenaga Kerja + Biaya Operasional + Penyesuaian Harga
```

**Contoh Lengkap - Kue Coklat**:
```
Biaya Bahan Baku        = Rp 1,750
Biaya Tenaga Kerja      = Rp 5,000
Biaya Operasional       = Rp 5,000
Penyesuaian Harga       = Rp 0 (tidak ada perubahan)
                        ─────────
HPP per Unit            = Rp 11,750
```

---

## Mengapa HPP Penting?

### 1. Menentukan Harga Jual Minimum
Harga jual harus lebih tinggi dari HPP, kalau tidak rugi!

**Contoh**:
- HPP: Rp 11,750
- Harga jual minimum: Rp 11,750 + margin
- Jika margin 30%: Rp 11,750 × 1.30 = Rp 15,275

### 2. Menghitung Keuntungan
Keuntungan = Harga Jual - HPP

**Contoh**:
- Harga jual: Rp 20,000
- HPP: Rp 11,750
- Keuntungan: Rp 20,000 - Rp 11,750 = Rp 8,250 (per potong)

### 3. Mengidentifikasi Produk Rugi
Jika ada produk dengan harga jual < HPP, produk itu rugi!

**Contoh**:
- Harga jual: Rp 10,000
- HPP: Rp 11,750
- Rugi: Rp 1,750 (per potong)

---

## Bagaimana HeyTrack Menghitung HPP?

### Biaya Bahan Baku
- Ambil semua ingredient dari recipe
- Kalikan dengan harga terbaru
- Jumlahkan semuanya

### Biaya Tenaga Kerja
- Lihat production history
- Hitung rata-rata biaya per unit
- Jika tidak ada data, gunakan default (Rp 5,000)

### Biaya Operasional
- Ambil semua operational costs yang aktif
- Alokasikan berdasarkan volume produksi
- Bagi dengan jumlah unit yang diproduksi

### Penyesuaian Harga
- Bandingkan harga bahan kemarin vs hari ini
- Hitung selisihnya
- Tambahkan ke HPP jika naik, kurangi jika turun

---

## Tips untuk HPP Akurat

### 1. Update Harga Bahan Baku
Setiap kali harga berubah, update di HeyTrack. Ini akan otomatis update HPP.

### 2. Catat Production Data
Setiap kali produksi, catat:
- Berapa banyak yang diproduksi
- Berapa biaya tenaga kerja
- Berapa lama waktu produksi

Ini akan membuat labor cost calculation lebih akurat.

### 3. Maintain Operational Costs
Update operational costs setiap bulan. Ini akan membuat overhead allocation lebih akurat.

### 4. Monitor HPP Trends
Lihat HPP history untuk setiap recipe. Jika ada perubahan drastis, cari tahu penyebabnya.

---

## Contoh Kasus

### Kasus 1: Produk Rugi
```
Kue Strawberry
- HPP: Rp 15,000
- Harga Jual: Rp 12,000
- Status: RUGI Rp 3,000 per potong

Solusi:
1. Naikkan harga jual ke minimal Rp 19,500 (margin 30%)
2. Atau kurangi biaya bahan baku (cari supplier lebih murah)
3. Atau kurangi biaya operasional
```

### Kasus 2: Margin Terlalu Rendah
```
Kue Coklat
- HPP: Rp 11,750
- Harga Jual: Rp 15,000
- Margin: (15,000 - 11,750) / 15,000 = 21.7%

Solusi:
1. Naikkan harga jual ke Rp 16,750 (margin 30%)
2. Atau kurangi HPP dengan optimasi biaya
```

### Kasus 3: Harga Bahan Naik
```
Coklat naik dari Rp 50,000/kg menjadi Rp 52,000/kg

Dampak:
- HPP Kue Coklat naik Rp 200 (dari Rp 11,750 menjadi Rp 11,950)
- Harus naikkan harga jual atau margin berkurang

Solusi:
1. Naikkan harga jual
2. Atau cari supplier coklat lebih murah
3. Atau kurangi jumlah coklat per resep
```

---

## FAQ

### Q: Kenapa HPP saya berubah-ubah?
**A**: Karena:
1. Harga bahan baku berubah
2. Biaya operasional berubah
3. Volume produksi berubah (mempengaruhi overhead allocation)

### Q: Bagaimana jika saya tidak punya production data?
**A**: HeyTrack akan menggunakan default value (Rp 5,000 untuk labor cost). Ini kurang akurat, tapi tetap bisa digunakan. Semakin banyak production data, semakin akurat HPP.

### Q: Apakah HPP termasuk profit?
**A**: Tidak! HPP hanya biaya. Profit = Harga Jual - HPP.

### Q: Berapa margin yang ideal?
**A**: Tergantung industri, tapi umumnya:
- Minimum: 20-30%
- Target: 30-50%
- Tinggi: >50%

### Q: Bagaimana jika HPP lebih tinggi dari harga jual?
**A**: Produk itu rugi! Harus naikkan harga jual atau kurangi biaya.

---

## Lihat Juga

- **HPP Calculator**: Lihat detail HPP untuk setiap recipe
- **Profit Report**: Lihat keuntungan dan margin untuk setiap produk
- **Operational Costs**: Manage biaya operasional
- **Ingredient Prices**: Update harga bahan baku

---

## Butuh Bantuan?

Jika ada pertanyaan tentang HPP, lihat:
1. HPP Calculator page - ada penjelasan detail
2. Profit Report - ada insights otomatis
3. Documentation - lihat HPP_FORMULA_DOCUMENTATION.md

