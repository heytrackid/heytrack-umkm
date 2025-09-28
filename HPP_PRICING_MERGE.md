# 🎯 HPP & Pricing - Halaman Terpadu

## 📋 Overview

Halaman HPP dan Pricing telah digabungkan menjadi satu halaman terpadu di `/hpp` untuk memberikan pengalaman yang lebih streamlined bagi pengguna UMKM F&B.

## 🏗️ Struktur Baru

### 📊 **Summary Statistics**
Menampilkan overview cepat:
- Total Resep
- Resep dengan Margin > 30% (Hijau)
- Resep dengan Margin 15-30% (Kuning) 
- Resep dengan Margin < 15% (Merah)

### 🧮 **Tab 1: Kalkulator HPP**
Fitur utama:
- **Auto-calculation HPP** berdasarkan komposisi resep
- **Visual cards** untuk setiap resep dengan info lengkap:
  - Nama resep & kategori
  - Daftar bahan yang digunakan
  - HPP, Harga Jual, Keuntungan
  - Status margin (Sangat Baik/Cukup Baik/Perlu Review)
- **Tips Optimasi HPP** dengan panduan praktis

### 🎯 **Tab 2: Strategi Pricing**  
Fitur utama:
- **Recipe Selector** - pilih resep untuk kalkulasi
- **Target Margin Calculator** - set persentase margin yang diinginkan
- **Real-time Price Calculation** - harga jual otomatis berdasarkan HPP & margin
- **Update Harga Resep** - simpan harga baru ke database
- **Panduan Margin** dengan kategori:
  - 20-30%: Margin Minimum
  - 30-50%: Margin Sehat  
  - 50-70%: Margin Optimal
  - >70%: Margin Premium

## ⚡ Benefits

### 🎯 **User Experience**
- Workflow lebih efisien - semua dalam satu tempat
- Tidak perlu pindah-pindah halaman
- Informasi HPP dan Pricing saling terintegrasi

### 📱 **Responsive Design**
- Tabs stack vertically di mobile
- Card layout responsive
- Touch-friendly interface

### 🧹 **Simplified Navigation**
- Menu sidebar berkurang dari 2 menjadi 1
- Badge "ALL-IN-ONE" menunjukkan kelengkapan fitur
- Mengurangi cognitive load pengguna

## 🔄 Migration Path

### Before:
```
/hpp ─ HPP Calculator (analisa resep)
/pricing ─ Target Harga (kalkulasi margin)
```

### After:  
```
/hpp ─┬─ Tab: Kalkulator HPP
      └─ Tab: Strategi Pricing
```

## 💻 Technical Implementation

### Frontend Structure:
```typescript
<Tabs defaultValue="hpp-calculator">
  <TabsList>
    <TabsTrigger value="hpp-calculator">Kalkulator HPP</TabsTrigger>
    <TabsTrigger value="pricing-strategy">Strategi Pricing</TabsTrigger>
  </TabsList>
  
  <TabsContent value="hpp-calculator">
    {/* HPP Calculator Content */}
  </TabsContent>
  
  <TabsContent value="pricing-strategy">
    {/* Pricing Strategy Content */}
  </TabsContent>
</Tabs>
```

### State Management:
- Shared recipe data between tabs
- Independent states for pricing calculations
- Real-time updates when recipe prices change

## 🎨 UI/UX Features

### Visual Indicators:
- **Color-coded badges** untuk status margin
- **Progress indicators** saat update harga
- **Highlight cards** untuk harga rekomendasi

### Interactive Elements:
- **Number inputs** dengan validation
- **Select dropdown** untuk memilih resep
- **Action buttons** dengan loading states

### Information Display:
- **Structured cards** untuk easy scanning
- **Grid layouts** yang responsive
- **Clear typography** hierarchy

## 🚀 Next Steps

### Potential Enhancements:
1. **Bulk Price Updates** - update multiple recipes sekaligus
2. **Price History** - tracking perubahan harga over time  
3. **Competitive Analysis** - compare dengan harga pasar
4. **Export Features** - print atau download price lists

### Analytics Integration:
- Track tab usage patterns
- Monitor margin optimization success
- Measure price update frequency

---

*Halaman terpadu HPP & Pricing memberikan solusi complete untuk UMKM F&B dalam mengelola harga pokok produksi dan strategi pricing dalam satu tempat yang mudah diakses.*