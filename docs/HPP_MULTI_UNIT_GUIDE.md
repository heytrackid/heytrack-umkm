# 📊 KALKULATOR HPP MULTI-UNIT UNTUK UMKM

## ✅ FITUR BARU: HITUNG HPP PER UNIT APAPUN!

Sekarang user UMKM bisa menghitung HPP dalam berbagai unit sesuai kebutuhan bisnis mereka.

---

## 🎯 UNIT YANG DIDUKUNG

### **📦 SATUAN UMUM UMKM:**
```yaml
Available_Units:
  - pcs: "Per pieces/potong"
  - buah: "Per buah"  
  - loaf: "Per loaf (roti)"
  - dozen: "Per dozen"
  - lusin: "Per lusin (12 pcs)"
  - kg: "Per kilogram"
  - ons: "Per ons"
  - bungkus: "Per bungkus/pack"
  - porsi: "Per porsi"
  - slice: "Per slice/iris"
```

---

## 🚀 CARA PAKAI

### **STEP 1: PILIH UNIT DASAR**
1. Di form **"Info Resep"**
2. Set **Jumlah** (contoh: 24)
3. Pilih **Satuan** (contoh: pcs)
4. Sistem akan hitung HPP per pcs

### **STEP 2: LIHAT KONVERSI OTOMATIS**
Sistem akan menampilkan HPP dalam unit lain:
- **Per Pcs**: Rp 2.500
- **Per Dozen**: Rp 30.000 (12 × Rp 2.500)
- **Per Kg**: Rp 100.000 (≈40 pcs/kg)
- **Per Ons**: Rp 10.000 (≈4 pcs/ons)

---

## 💡 CONTOH REAL BUSINESS CASE

### **🧁 CASE 1: USAHA CUPCAKE**
```yaml
Setup:
  product: "Cupcake Mini"
  base_unit: pcs
  quantity: 50
  hpp_per_pcs: 1500
  
Konversi_Otomatis:
  per_dozen: 18000   # 12 × 1500
  per_kg: 60000      # ≈40 pcs/kg  
  per_ons: 6000      # ≈4 pcs/ons
```

**Keuntungan untuk UMKM:**
- Jual satuan: Rp 3.000/pcs (profit 50%)
- Jual dozen: Rp 25.000/dozen (diskon + volume)
- Jual kilogram: Rp 80.000/kg (bulk sale)

### **🍞 CASE 2: USAHA ROTI**
```yaml
Setup:
  product: "Roti Tawar"
  base_unit: loaf
  quantity: 5
  hpp_per_loaf: 8500
  
Konversi_Otomatis:
  per_slice: 425     # loaf ≈ 20 slice
  per_dozen_slice: 5100  # 12 slice
  per_kg: 34000      # ≈4 loaf/kg
```

### **🍪 CASE 3: USAHA COOKIES**
```yaml
Setup:
  product: "Cookies Coklat"  
  base_unit: dozen
  quantity: 10
  hpp_per_dozen: 15000
  
Konversi_Otomatis:
  per_pcs: 1250      # 15000 ÷ 12
  per_kg: 50000      # ≈40 pcs/kg
  per_ons: 5000      # ≈4 pcs/ons
```

---

## 🧮 RUMUS KONVERSI OTOMATIS

### **PCS ↔ DOZEN**
```javascript
per_dozen = per_pcs × 12
per_pcs = per_dozen ÷ 12
```

### **PCS ↔ KG** 
```javascript
per_kg = per_pcs × 40    // Asumsi 40 pcs/kg
per_pcs = per_kg ÷ 40
```

### **KG ↔ ONS**
```javascript
per_kg = per_ons × 10
per_ons = per_kg ÷ 10
```

### **CUSTOM RATIOS**
User bisa adjust ratio sesuai produk:
- **Kue kering**: ~50 pcs/kg
- **Cupcake**: ~25 pcs/kg  
- **Donut**: ~15 pcs/kg
- **Roti besar**: ~8 pcs/kg

---

## 📱 UI/UX IMPROVEMENTS

### **📋 INPUT FORM**
```
Before:
[Jumlah Porsi: ___]

After:  
[Jumlah: ___] [Satuan: dropdown]
```

### **📊 HPP SUMMARY**
```
Before:
HPP per Porsi: Rp 8.500

After:
HPP per loaf: Rp 8.500
```

### **🔄 CONVERSION CALCULATOR**
```yaml
New_Section: "💡 Konversi HPP ke Unit Lain"
Layout: 2x2 grid
Content:
  - Per Pcs: Rp X.XXX
  - Per Dozen: Rp X.XXX  
  - Per Kg: Rp X.XXX
  - Per Ons: Rp X.XXX
```

---

## 🎯 BUSINESS BENEFITS

### **👩‍💼 UNTUK UMKM OWNER:**
- ✅ **Fleksibilitas Harga**: Bisa jual per pcs, per dozen, per kg
- ✅ **Strategy Pricing**: Volume discount otomatis
- ✅ **Market Adaptability**: Sesuaikan unit dengan pasar
- ✅ **Profit Optimization**: Cari unit terlaris dengan margin terbaik

### **🛒 UNTUK CUSTOMER:**
- ✅ **Pilihan Fleksibel**: Beli sesuai kebutuhan
- ✅ **Volume Discount**: Lebih murah beli banyak
- ✅ **Clear Pricing**: Harga per unit transparan

### **📈 UNTUK BUSINESS GROWTH:**
- ✅ **Market Expansion**: Target B2B (per kg) dan B2C (per pcs)
- ✅ **Competitive Pricing**: Compare harga per unit dengan kompetitor
- ✅ **Inventory Planning**: Stock management per unit optimal

---

## 🔮 FUTURE ENHANCEMENTS

### **🎯 PLANNED FEATURES:**
- [ ] **Custom Unit Creator**: User bisa buat unit sendiri
- [ ] **Conversion Rate Editor**: Edit ratio pcs/kg sesuai produk
- [ ] **Multi-Product Comparison**: Compare HPP antar produk
- [ ] **Price Alert System**: Notif jika HPP berubah significant
- [ ] **Export Unit Analysis**: Report HPP per unit ke Excel

### **🤖 AI ENHANCEMENTS:**
- [ ] **Smart Unit Recommendation**: AI suggest unit terbaik
- [ ] **Market Price Comparison**: Compare dengan harga pasar
- [ ] **Optimal Packaging**: Suggest packaging paling ekonomis

---

## 📊 TECHNICAL IMPLEMENTATION

### **🏗️ CODE STRUCTURE**
```typescript
interface SimpleRecipe {
  // ... existing fields
  portionUnit: string  // NEW: 'pcs', 'dozen', 'kg', etc
}

const PORTION_UNITS = [
  'pcs', 'buah', 'loaf', 'dozen', 'lusin', 
  'kg', 'ons', 'bungkus', 'porsi', 'slice'
]
```

### **⚡ CONVERSION LOGIC**
```typescript  
const convertUnit = (basePrice: number, fromUnit: string, toUnit: string) => {
  const ratios = {
    pcs_to_dozen: 12,
    pcs_to_kg: 40,
    kg_to_ons: 10,
    // ... more ratios
  }
  
  return calculateConvertedPrice(basePrice, ratios)
}
```

---

**🎉 Sekarang UMKM bisa hitung HPP dengan unit apapun sesuai kebutuhan bisnis mereka!**

**📱 Try it: Dashboard → HPP Calculator → Pilih unit → Lihat konversi otomatis**