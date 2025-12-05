# HPP (Harga Pokok Produksi) Formula Documentation

**Last Updated**: December 5, 2025  
**Status**: ✅ VERIFIED & ACCURATE

---

## Overview

HPP adalah total biaya untuk memproduksi satu unit produk. Rumus HPP di HeyTrack menggunakan pendekatan **Activity-Based Costing** dengan komponen:

1. **Material Cost** - Biaya bahan baku
2. **Labor Cost** - Biaya tenaga kerja
3. **Overhead Cost** - Biaya operasional
4. **WAC Adjustment** - Penyesuaian untuk perubahan harga

---

## HPP Formula (Per Unit)

```
HPP per unit = Material Cost per Unit + Labor Cost per Unit + Overhead Cost per Unit + WAC Adjustment per Unit
```

### Breakdown:

#### 1. Material Cost per Unit
```
Material Cost per Unit = Total Material Cost / Servings

Dimana:
Total Material Cost = Σ (Ingredient Quantity × Current Price per Unit)

PENTING: Menggunakan CURRENT PRICE, bukan WAC
```

**Example**:
```
Recipe: Kue Coklat (10 servings)
- Tepung: 500g × Rp 5,000/kg = Rp 2,500
- Coklat: 200g × Rp 50,000/kg = Rp 10,000
- Telur: 5 butir × Rp 2,000/butir = Rp 10,000
- Gula: 300g × Rp 10,000/kg = Rp 3,000

Total Material Cost = Rp 25,500
Material Cost per Unit = Rp 25,500 / 10 = Rp 2,550
```

---

#### 2. Labor Cost per Unit
```
Labor Cost per Unit = Weighted Average dari Recent Productions

Rumus:
Labor Cost per Unit = Total Labor Cost (last 100 productions) / Total Quantity (last 100 productions)

Fallback (jika tidak ada production data):
Labor Cost per Unit = DEFAULT_LABOR_COST_PER_SERVING (Rp 5,000)
```

**Calculation Logic**:
1. Ambil 100 production terakhir yang COMPLETED
2. Hitung total labor cost dari semua production
3. Hitung total quantity dari semua production
4. Bagi total labor cost dengan total quantity

**Example**:
```
Recent Productions:
- Prod 1: 10 units, Labor Cost Rp 50,000
- Prod 2: 15 units, Labor Cost Rp 75,000
- Prod 3: 20 units, Labor Cost Rp 100,000

Total Labor Cost = Rp 225,000
Total Quantity = 45 units
Labor Cost per Unit = Rp 225,000 / 45 = Rp 5,000
```

**⚠️ LIMITATION**: Jika recipe baru atau jarang diproduksi, akan menggunakan default value (Rp 5,000). Ini bisa tidak akurat.

---

#### 3. Overhead Cost per Unit
```
Overhead Cost per Unit = (Total Operational Costs × Allocation Ratio) / Recipe Production Volume

Dimana:
Allocation Ratio = Recipe Production Volume (last 30 days) / Total Production Volume (last 30 days)

Fallback (jika tidak ada production data):
Overhead Cost per Unit = Total Operational Costs / Number of Active Recipes
```

**Calculation Logic**:
1. Ambil semua operational costs yang active
2. Hitung total production volume untuk recipe ini (last 30 days)
3. Hitung total production volume untuk semua recipes (last 30 days)
4. Hitung allocation ratio = recipe volume / total volume
5. Alokasikan overhead = total operational costs × allocation ratio
6. Bagi dengan recipe production volume

**Example**:
```
Total Operational Costs = Rp 10,000,000 (per bulan)

Recipe: Kue Coklat
- Production volume (30 days) = 500 units
- Total production volume (30 days) = 2,000 units
- Allocation Ratio = 500 / 2,000 = 0.25 (25%)

Allocated Overhead = Rp 10,000,000 × 0.25 = Rp 2,500,000
Overhead Cost per Unit = Rp 2,500,000 / 500 = Rp 5,000
```

**⚠️ LIMITATION**: Jika recipe baru atau tidak diproduksi dalam 30 hari terakhir, akan menggunakan fallback (equal allocation). Ini bisa tidak akurat.

---

#### 4. WAC Adjustment per Unit
```
WAC Adjustment per Unit = (WAC - Current Price) × Qty per Unit

Dimana:
WAC = Weighted Average Cost dari recent purchases (last 30 days)
Current Price = Current price_per_unit dari ingredient
Qty per Unit = Ingredient Quantity / Servings

PENTING: Ini HANYA untuk tracking/reporting, BUKAN untuk material cost
```

**Calculation Logic**:
1. Ambil 50 stock transactions terakhir (PURCHASE type) untuk ingredient
2. Hitung WAC = Total Value / Total Quantity
3. Bandingkan dengan current price
4. Hitung adjustment = (WAC - Current Price) × Qty per Unit

**Example**:
```
Ingredient: Coklat

Recent Purchases (last 30 days):
- Purchase 1: 100kg @ Rp 50,000/kg = Rp 5,000,000
- Purchase 2: 50kg @ Rp 52,000/kg = Rp 2,600,000
- Purchase 3: 75kg @ Rp 48,000/kg = Rp 3,600,000

Total Quantity = 225kg
Total Value = Rp 11,200,000
WAC = Rp 11,200,000 / 225 = Rp 49,777.78/kg

Current Price = Rp 50,000/kg
Difference = Rp 49,777.78 - Rp 50,000 = -Rp 222.22/kg

Recipe: Kue Coklat (10 servings)
- Coklat per recipe = 200g = 0.2kg
- Qty per Unit = 0.2kg / 10 = 0.02kg

WAC Adjustment per Unit = -Rp 222.22 × 0.02 = -Rp 4.44
```

**Interpretation**:
- Jika WAC > Current Price: Adjustment positif (harga turun, untung)
- Jika WAC < Current Price: Adjustment negatif (harga naik, rugi)

---

## Total HPP Calculation

```
HPP per Unit = Material Cost per Unit + Labor Cost per Unit + Overhead Cost per Unit + WAC Adjustment per Unit

Total HPP (per batch) = HPP per Unit × Servings
```

**Complete Example**:
```
Recipe: Kue Coklat (10 servings)

Material Cost per Unit = Rp 2,550
Labor Cost per Unit = Rp 5,000
Overhead Cost per Unit = Rp 5,000
WAC Adjustment per Unit = -Rp 4.44

HPP per Unit = Rp 2,550 + Rp 5,000 + Rp 5,000 - Rp 4.44 = Rp 12,545.56

Total HPP (per batch) = Rp 12,545.56 × 10 = Rp 125,455.60
```

---

## Profit Calculation

### Gross Profit (per unit)
```
Gross Profit per Unit = Selling Price - HPP per Unit
Gross Margin % = (Gross Profit per Unit / Selling Price) × 100%
```

**Example**:
```
Selling Price = Rp 20,000
HPP per Unit = Rp 12,545.56

Gross Profit per Unit = Rp 20,000 - Rp 12,545.56 = Rp 7,454.44
Gross Margin % = (Rp 7,454.44 / Rp 20,000) × 100% = 37.27%
```

### Net Profit (per order/period)
```
Net Profit = Total Revenue - Total COGS - Operating Expenses

Dimana:
Total Revenue = Σ (Order Total Amount)
Total COGS = Σ (Order Item Quantity × HPP per Unit)
Operating Expenses = Σ (Financial Records)

Net Profit Margin % = (Net Profit / Total Revenue) × 100%
```

**Example**:
```
Period: 1 Bulan

Total Revenue = Rp 10,000,000
Total COGS = Rp 5,000,000
Operating Expenses = Rp 2,000,000

Net Profit = Rp 10,000,000 - Rp 5,000,000 - Rp 2,000,000 = Rp 3,000,000
Net Profit Margin % = (Rp 3,000,000 / Rp 10,000,000) × 100% = 30%
```

---

## Data Validation Rules

### HPP Calculation Validation:
1. ✅ Servings > 0 (tidak boleh 0 atau negatif)
2. ✅ Material Cost ≥ 0 (tidak boleh negatif)
3. ✅ Labor Cost ≥ 0 (tidak boleh negatif)
4. ✅ Overhead Cost ≥ 0 (tidak boleh negatif)
5. ✅ Cost per Unit ≥ 0 (tidak boleh negatif)
6. ✅ Cost per Unit ≠ NaN (harus valid number)

### Profit Calculation Validation:
1. ✅ Revenue ≥ 0
2. ✅ COGS ≥ 0
3. ✅ Operating Expenses ≥ 0
4. ✅ Profit Margin antara -100% sampai 100%

---

## Accuracy Considerations

### Factors yang Mempengaruhi Akurasi:

1. **Material Cost**: ✅ AKURAT
   - Menggunakan current price dari database
   - Diupdate setiap kali ingredient price berubah

2. **Labor Cost**: ⚠️ SEMI-AKURAT
   - Berdasarkan historical production data
   - Fallback ke default value jika tidak ada data
   - Bisa tidak akurat untuk recipe baru

3. **Overhead Cost**: ⚠️ SEMI-AKURAT
   - Alokasi berdasarkan production volume
   - Fallback ke equal allocation jika tidak ada data
   - Bisa tidak akurat untuk recipe baru atau jarang diproduksi

4. **WAC Adjustment**: ✅ AKURAT
   - Berdasarkan actual purchase transactions
   - Hanya untuk tracking, tidak mempengaruhi material cost

---

## Best Practices

### Untuk Akurasi Maksimal:

1. **Update Ingredient Prices Regularly**
   - Setiap kali harga berubah, update di sistem
   - Ini akan trigger HPP recalculation otomatis

2. **Record Production Data Accurately**
   - Catat labor cost setiap production
   - Catat actual quantity produced
   - Ini akan improve labor cost calculation

3. **Maintain Operational Costs**
   - Update operational costs setiap bulan
   - Kategorisasi dengan benar
   - Ini akan improve overhead allocation

4. **Monitor HPP Trends**
   - Lihat HPP history untuk setiap recipe
   - Identifikasi cost spikes
   - Ambil action jika ada anomali

---

## Troubleshooting

### HPP Terlalu Tinggi?
1. Check material cost - apakah ingredient price terlalu tinggi?
2. Check labor cost - apakah ada production dengan labor cost tinggi?
3. Check overhead allocation - apakah recipe ini mendapat alokasi terlalu besar?

### HPP Terlalu Rendah?
1. Check apakah semua ingredients sudah diinput?
2. Check apakah servings sudah benar?
3. Check apakah ada production data yang bisa improve labor cost?

### HPP Tidak Update?
1. Check apakah ingredient price sudah diupdate?
2. Check apakah operational costs sudah diupdate?
3. Manual recalculate dari HPP page

---

## References

- **File**: `src/services/hpp/HppCalculatorService.ts`
- **File**: `src/services/reports/ReportService.ts`
- **Config**: `src/lib/constants/hpp-config.ts`
- **Audit**: `HPP_ACCURACY_AUDIT.md`

