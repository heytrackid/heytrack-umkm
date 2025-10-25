# 📊 PANDUAN LENGKAP MENGHITUNG HPP UNTUK UMKM

## 🎯 Dashboard Sudah Responsive ✅

**Status Dashboard**: Fully Responsive 
- ✅ **Mobile**: `grid-cols-1` untuk layar kecil
- ✅ **Tablet**: `grid-cols-2` untuk layar sedang  
- ✅ **Desktop**: `lg:grid-cols-3` dan `lg:grid-cols-4` untuk layar besar
- ✅ **Light/Dark Mode**: Adaptive theme dengan `dark:` classes
- ✅ **Touch-friendly**: Optimized untuk mobile interaction

---

## 💡 APA ITU HPP (HARGA POKOK PRODUKSI)?

HPP adalah **total biaya yang dikeluarkan untuk memproduksi satu unit produk**. HPP penting untuk:
- 📈 Menentukan harga jual yang menguntungkan
- 💰 Menghitung profit margin
- 📊 Menganalisis efisiensi produksi
- 🎯 Membuat keputusan bisnis yang tepat

---

## 🚀 LANGKAH-LANGKAH MENGHITUNG HPP DARI NOL

### **STEP 1: PERSIAPAN DATA**

#### 1.1 Masuk ke Dashboard
```
🏠 Dashboard → Quick Actions → HPP Calculator
📱 Atau klik: http://localhost:3000/hpp-simple
```

#### 1.2 Pastikan Data Master Lengkap
- ✅ **Bahan Baku** (via menu "Bahan Simple")
- ✅ **Resep Produk** (via menu "Resep Simple") 
- ✅ **Data Pengeluaran** (via menu "Pengeluaran Simple")

---

### **STEP 2: INPUT BAHAN BAKU**

#### 2.1 Klik Menu "Bahan Simple"
```
📦 Bahan Simple → Tambah Data
```

#### 2.2 Input Data Setiap Bahan
**Contoh untuk UMKM:**
```
Nama: Tepung Terigu
Harga: Rp 15.000
Satuan: kg
Stok: 50 kg
Supplier: Toko Bahan A
```

**Data Bahan Lengkap:**
- 🌾 Tepung terigu: Rp 15.000/kg
- 🥚 Telur: Rp 28.000/kg  
- 🧈 Margarin: Rp 25.000/kg
- 🍯 Gula pasir: Rp 14.000/kg
- 🥛 Susu: Rp 12.000/liter
- 🧂 Garam: Rp 8.000/kg

---

### **STEP 3: BUAT RESEP PRODUK**

#### 3.1 Klik Menu "Resep Simple"
```
👨‍🍳 Resep Simple → Tambah Resep
```

#### 3.2 Input Detail Resep
**Contoh: Roti Tawar**
```
Nama Produk: Roti Tawar
Yield: 2 loaf
Waktu Produksi: 4 jam
Kategori: Roti
```

#### 3.3 Tambahkan Komposisi Bahan
```
Bahan 1: Tepung Terigu - 500g
Bahan 2: Telur - 2 butir (120g)
Bahan 3: Margarin - 100g  
Bahan 4: Gula Pasir - 80g
Bahan 5: Susu - 200ml
Bahan 6: Garam - 5g
```

---

### **STEP 4: INPUT BIAYA OPERASIONAL**

#### 4.1 Klik Menu "Pengeluaran Simple" 
```
💳 Pengeluaran Simple → Tambah Pengeluaran
```

#### 4.2 Catat Semua Biaya Operasional
**Biaya Harian:**
- ⚡ Listrik: Rp 50.000/hari
- 💧 Air: Rp 20.000/hari  
- 🔥 Gas: Rp 30.000/hari
- 👨‍🍳 Gaji karyawan: Rp 150.000/hari
- 🏢 Sewa tempat: Rp 100.000/hari (jika ada)

**Biaya per Produksi:**
- 📦 Kemasan: Rp 2.000/unit
- 🚚 Transport: Rp 5.000/batch  
- 🧽 Pembersihan: Rp 3.000/hari

---

### **STEP 5: HITUNG HPP OTOMATIS**

#### 5.1 Buka HPP Calculator
```
🧮 HPP Calculator → Pilih Produk → "Roti Tawar"
```

#### 5.2 System Akan Menghitung Otomatis:

**A. BIAYA BAHAN BAKU (Material Cost)**
```
Tepung 500g    = (500/1000) × Rp 15.000 = Rp 7.500
Telur 120g     = (120/1000) × Rp 28.000 = Rp 3.360  
Margarin 100g  = (100/1000) × Rp 25.000 = Rp 2.500
Gula 80g       = (80/1000) × Rp 14.000  = Rp 1.120
Susu 200ml     = (200/1000) × Rp 12.000 = Rp 2.400
Garam 5g       = (5/1000) × Rp 8.000    = Rp 40
----------------------------------------
TOTAL BAHAN BAKU = Rp 16.920
```

**B. BIAYA TENAGA KERJA (Labor Cost)**  
```
Waktu produksi: 4 jam
Upah per jam: Rp 150.000/8 jam = Rp 18.750/jam
Labor Cost = 4 × Rp 18.750 = Rp 75.000
```

**C. BIAYA OVERHEAD (Overhead Cost)**
```
Listrik (4 jam): (4/24) × Rp 50.000 = Rp 8.333
Air (4 jam): (4/24) × Rp 20.000 = Rp 3.333  
Gas (4 jam): (4/24) × Rp 30.000 = Rp 5.000
Kemasan: 2 loaf × Rp 2.000 = Rp 4.000
Overhead lain: Rp 5.000
----------------------------------------
TOTAL OVERHEAD = Rp 25.666
```

**D. HPP TOTAL**
```
HPP = Material + Labor + Overhead  
HPP = Rp 16.920 + Rp 75.000 + Rp 25.666
HPP = Rp 117.586 untuk 2 loaf

HPP per loaf = Rp 117.586 ÷ 2 = Rp 58.793
```

---

### **STEP 6: TENTUKAN HARGA JUAL**

#### 6.1 Hitung Margin Keuntungan
```
Target Profit: 30%
Harga Jual = HPP ÷ (1 - Profit Margin)
Harga Jual = Rp 58.793 ÷ (1 - 0.30)
Harga Jual = Rp 58.793 ÷ 0.70
Harga Jual = Rp 83.990
```

#### 6.2 Pembulatan Harga
```
Harga Jual Ideal = Rp 84.000 per loaf
Profit = Rp 84.000 - Rp 58.793 = Rp 25.207
Profit Margin = 30%
```

---

## 📋 CHECKLIST VERIFIKASI DATA

### ✅ **Data Yang Dibutuhkan:**
- [ ] **Daftar semua bahan baku** dengan harga terkini
- [ ] **Resep lengkap** dengan takaran akurat  
- [ ] **Waktu produksi** yang realistis
- [ ] **Biaya listrik, air, gas** harian/bulanan
- [ ] **Gaji karyawan** dan jam kerja
- [ ] **Biaya kemasan** per unit
- [ ] **Biaya operasional lainnya**

### ✅ **Validasi Hasil:**
- [ ] **HPP masuk akal** dibanding kompetitor?
- [ ] **Profit margin** sesuai target bisnis?
- [ ] **Harga jual** diterima pasar?
- [ ] **Break-even point** tercapai?

---

## 🎯 TIPS OPTIMASI HPP

### **1. Efisiensi Bahan Baku**
- 🔄 **Bulk buying** untuk diskon harga
- 📦 **Minimize waste** dengan portion control
- 🏪 **Compare suppliers** secara berkala

### **2. Optimasi Tenaga Kerja**  
- ⚡ **Batch production** untuk efisiensi
- 📚 **Training karyawan** untuk produktivitas
- 🕒 **Time management** yang ketat

### **3. Kontrol Overhead**
- 💡 **Energy efficiency** (LED, timer)
- 🔧 **Preventive maintenance** alat
- 📊 **Monitor utility usage** harian

---

## 📊 LAPORAN HPP OTOMATIS

### **Dashboard Analytics:**
- 📈 **Trend HPP** per produk/bulan
- 💰 **Profit margin analysis**  
- 📉 **Cost breakdown chart**
- 🎯 **Performance indicators**

### **Export Data:**
```
📄 Export ke Excel/PDF
📊 Generate cost reports  
📈 Profit loss statements
📋 Inventory valuation
```

---

## 🚨 TROUBLESHOOTING

### **Problem 1: HPP Terlalu Tinggi**
**Solusi:**
- 🔍 Review supplier prices
- ⚡ Optimasi proses produksi  
- 📦 Kurangi waste materials
- 🕒 Improve time efficiency

### **Problem 2: Data Tidak Akurat**
**Solusi:**
- 📝 Update harga bahan berkala
- ⚖️ Timbang ulang komposisi resep
- 🕐 Catat actual production time
- 💳 Record semua expenses

### **Problem 3: System Error**
**Solusi:**
- 🔄 Refresh halaman HPP Calculator
- 💾 Check data bahan baku tersimpan
- ✅ Verify resep sudah lengkap
- 📞 Contact support jika perlu

---

## 📞 SUPPORT & BANTUAN

- 💬 **Live Chat**: Available di dashboard
- 📧 **Email**: support@heytrack.id  
- 📱 **WhatsApp**: +62xxx-xxxx-xxxx
- 📚 **Knowledge Base**: /docs/help

---

## 🎓 NEXT STEPS

Setelah HPP selesai:
1. 📊 **Monitor performance** via dashboard
2. 🔄 **Update prices** secara berkala  
3. 📈 **Analyze trends** untuk improvement
4. 🎯 **Set alerts** untuk cost changes
5. 📋 **Generate reports** untuk analisa bisnis

---

**💡 Pro Tips:**
- Update harga bahan setiap minggu
- Review HPP setiap bulan  
- Compare dengan kompetitor
- Set profit margin realistis (20-40%)
- Monitor inventory turnover

**🚀 Dengan sistem ini, UMKM dapat menghitung HPP secara akurat dan otomatis!**