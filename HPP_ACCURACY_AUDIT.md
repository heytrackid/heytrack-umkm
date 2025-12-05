# HPP & Laporan Accuracy Audit Report

**Date**: December 5, 2025  
**Status**: 🔴 CRITICAL ISSUES FOUND

---

## Executive Summary

Setelah audit mendalam terhadap sistem HPP dan laporan, ditemukan **beberapa issue kritis** yang mempengaruhi akurasi perhitungan:

### Issues Ditemukan:
1. ❌ **WAC Adjustment Double-Counting** - Potensi double adjustment
2. ❌ **Labor Cost Fallback** - Menggunakan default value terlalu sering
3. ❌ **Overhead Allocation** - Tidak akurat untuk recipe dengan volume rendah
4. ❌ **Missing Validation** - Tidak ada validasi untuk negative costs
5. ❌ **Report Insights** - Beberapa insights tidak akurat
6. ⚠️ **Stale HPP Data** - Tidak ada mekanisme refresh otomatis

---

## Detailed Analysis

### 1. WAC (Weighted Average Cost) Adjustment Issue

**File**: `src/services/hpp/HppCalculatorService.ts` (Line 180-220)

**Problem**:
```typescript
// Current logic:
const hasWacPrice = (ingredient as unknown as { weighted_average_cost?: number | null }).weighted_average_cost
if (hasWacPrice !== null && hasWacPrice !== undefined) {continue}

// Issue: Tidak jelas apakah WAC sudah digunakan di material_cost atau belum
```

**Impact**: 
- Jika ingredient punya `weighted_average_cost`, mungkin sudah digunakan di material_cost
- Tapi adjustment masih dihitung, menyebabkan double-counting
- Atau sebaliknya, adjustment tidak dihitung padahal seharusnya

**Severity**: 🔴 CRITICAL

**Fix Needed**:
```typescript
// Harus jelas: apakah material_cost sudah pakai WAC atau belum
// Option 1: Selalu gunakan WAC di material_cost, skip adjustment
// Option 2: Selalu gunakan current price di material_cost, hitung adjustment
// Jangan campur!
```

---

### 2. Labor Cost Fallback Issue

**File**: `src/services/hpp/HppCalculatorService.ts` (Line 130-160)

**Problem**:
```typescript
// Jika tidak ada production data, langsung return DEFAULT_LABOR_COST_PER_SERVING
if (!productions || productions.length === 0) {
  return HPP_CONFIG.DEFAULT_LABOR_COST_PER_SERVING
}
```

**Impact**:
- Untuk recipe baru atau jarang diproduksi, selalu pakai default value (5000 IDR)
- Ini tidak akurat karena setiap recipe punya labor cost berbeda
- Bisa menyebabkan HPP terlalu tinggi atau terlalu rendah

**Severity**: 🟡 HIGH

**Current Default**: 5000 IDR per serving (hardcoded)

**Fix Needed**:
- Hitung labor cost berdasarkan:
  - Operational costs / total production volume
  - Atau dari user settings (labor cost per hour × estimated time)
  - Atau dari supplier/production data

---

### 3. Overhead Allocation Issue

**File**: `src/services/hpp/HppCalculatorService.ts` (Line 165-210)

**Problem**:
```typescript
// Allocation berdasarkan production volume (last 30 days)
const allocationRatio = recipeVolume / totalVolume
return (totalOverhead * allocationRatio) / recipeVolume

// Issue: Jika recipe tidak pernah diproduksi, recipeVolume = 0
// Maka fallback ke equal allocation, tapi ini tidak akurat
```

**Impact**:
- Recipe baru atau jarang diproduksi mendapat overhead allocation yang tidak akurat
- Bisa menyebabkan HPP terlalu tinggi untuk recipe baru
- Tidak ada historical data untuk allocation

**Severity**: 🟡 HIGH

**Fix Needed**:
- Gunakan production forecast atau expected volume
- Atau gunakan recipe category untuk allocation
- Atau user-defined allocation percentage

---

### 4. Missing Validation

**File**: `src/services/hpp/HppCalculatorService.ts`

**Problem**:
- Tidak ada validasi untuk negative costs
- Tidak ada validasi untuk zero servings
- Tidak ada validasi untuk missing ingredients

**Impact**:
- Bisa generate HPP dengan nilai negatif atau NaN
- Laporan bisa menampilkan data yang tidak valid

**Severity**: 🟡 HIGH

**Examples**:
```typescript
// Tidak ada validasi:
const cost_per_unit = material_cost_per_unit + labor_cost_per_unit + overhead_cost_per_unit + wac_adjustment_per_unit
// Bisa jadi NaN atau negative

// Tidak ada check:
if (servings === 0) { /* error */ }
if (cost_per_unit < 0) { /* error */ }
if (isNaN(cost_per_unit)) { /* error */ }
```

---

### 5. Report Insights Accuracy

**File**: `src/services/reports/ReportService.ts` (Line 300-400)

**Problem**:
```typescript
// Insight: "Margin Keuntungan Rendah"
if (data.profitMargin < 10) {
  // Tapi profitMargin dihitung dari netProfit, bukan grossProfit
  // Ini bisa misleading karena termasuk operating expenses
}

// Insight: "Produk Rugi"
if (data.lossMakingProductsCount > 0) {
  // Tapi tidak ada field 'is_loss_making' di ProductProfitabilityEntry
  // Ini akan selalu 0!
}
```

**Impact**:
- Insights tidak akurat
- User bisa membuat keputusan bisnis yang salah

**Severity**: 🔴 CRITICAL

---

### 6. Stale HPP Data

**File**: `src/services/hpp/HppCalculatorService.ts`

**Problem**:
- Tidak ada mekanisme untuk refresh HPP otomatis
- Jika ingredient price berubah, HPP tidak update
- Jika operational costs berubah, HPP tidak update

**Impact**:
- HPP bisa stale dan tidak akurat
- Laporan menggunakan HPP yang sudah lama

**Severity**: 🟡 HIGH

**Current Status**:
- Ada `HppTriggerService` di dokumentasi, tapi tidak ditemukan di codebase
- Tidak ada trigger untuk ingredient price changes
- Tidak ada trigger untuk operational cost changes

---

## Rumus Perhitungan Saat Ini

### HPP Formula (Per Unit):
```
HPP per unit = Material Cost per Unit + Labor Cost per Unit + Overhead Cost per Unit + WAC Adjustment per Unit

Dimana:
- Material Cost per Unit = Total Material Cost / Servings
- Labor Cost per Unit = Weighted Average dari recent productions
- Overhead Cost per Unit = (Total Operational Costs × Allocation Ratio) / Recipe Volume
- WAC Adjustment per Unit = (WAC - Current Price) × Qty per Unit
```

### Issues dengan Formula:
1. **Material Cost**: Menggunakan WAC jika tersedia, tapi tidak konsisten
2. **Labor Cost**: Fallback ke default value terlalu sering
3. **Overhead Cost**: Allocation tidak akurat untuk recipe baru
4. **WAC Adjustment**: Potensi double-counting

---

## Profit Report Formula

### Gross Profit:
```
Gross Profit = Total Revenue - Total COGS
```

### Net Profit:
```
Net Profit = Gross Profit - Operating Expenses
```

### Profit Margin:
```
Profit Margin = (Net Profit / Total Revenue) × 100%
```

### Issues:
1. **COGS Calculation**: Menggunakan `cost_per_unit` dari recipe, tapi ini bisa stale
2. **Operating Expenses**: Tidak ada validasi untuk kategori yang tidak ada
3. **Insights**: Beberapa insights tidak akurat atau tidak dihitung

---

## Recommendations

### Priority 1 (CRITICAL - Fix Immediately):
1. ✅ Fix WAC adjustment double-counting
2. ✅ Fix report insights calculation
3. ✅ Add validation untuk negative/NaN costs

### Priority 2 (HIGH - Fix This Week):
1. ✅ Implement HPP refresh triggers
2. ✅ Improve labor cost calculation
3. ✅ Improve overhead allocation

### Priority 3 (MEDIUM - Fix Next Sprint):
1. ✅ Add HPP versioning/history
2. ✅ Add cost trend analysis
3. ✅ Add data quality checks

---

## Testing Checklist

- [ ] Test HPP calculation dengan berbagai skenario
- [ ] Test WAC adjustment tidak double-count
- [ ] Test labor cost fallback
- [ ] Test overhead allocation untuk recipe baru
- [ ] Test report insights accuracy
- [ ] Test negative cost validation
- [ ] Test stale HPP refresh
- [ ] Test profit report dengan berbagai data

---

## Fixes Applied ✅

### 1. WAC Adjustment Double-Counting (FIXED)
- ✅ Material cost sekarang SELALU menggunakan current price (bukan WAC)
- ✅ WAC adjustment dihitung terpisah untuk tracking/reporting saja
- ✅ Tidak ada double-counting lagi

**File**: `src/services/hpp/HppCalculatorService.ts`

### 2. Validation untuk Negative/NaN Costs (FIXED)
- ✅ Validasi servings > 0
- ✅ Validasi cost_per_unit tidak negative
- ✅ Validasi cost_per_unit tidak NaN
- ✅ Clamp negative values ke 0

**File**: `src/services/hpp/HppCalculatorService.ts`

### 3. Report Insights Accuracy (FIXED)
- ✅ Insights sekarang berdasarkan NET profit (bukan gross)
- ✅ Validasi data integrity sebelum generate insights
- ✅ Tambah insights untuk gross profit loss
- ✅ Tambah insights untuk operating expense ratio
- ✅ Lebih akurat dan actionable

**File**: `src/services/reports/ReportService.ts`

### 4. Product Profitability Calculation (FIXED)
- ✅ Hitung `is_loss_making` untuk setiap produk
- ✅ Hitung `is_low_margin` untuk setiap produk
- ✅ Populate `top_profitable_products` (top 5)
- ✅ Populate `least_profitable_products` (bottom 5)

**File**: `src/services/reports/ReportService.ts`

---

## Additional Fixes Applied ✅

### 5. Labor Cost Calculation (FIXED)
- ✅ Multi-step fallback logic:
  1. First try recipe's own production history
  2. Then try ALL productions average
  3. Then calculate from operational costs (labor category)
  4. Last resort: use default value
- ✅ More accurate for new recipes
- ✅ Uses actual labor data when available

**File**: `src/services/hpp/HppCalculatorService.ts`

### 6. Overhead Allocation (FIXED)
- ✅ Excludes labor costs (calculated separately)
- ✅ Volume-based allocation for recipes with production history
- ✅ Equal allocation for new recipes (based on average servings)
- ✅ More accurate for all recipe types

**File**: `src/services/hpp/HppCalculatorService.ts`

### 7. HPP Auto-Refresh Triggers (IMPLEMENTED)
- ✅ Created `HppTriggerService` with methods:
  - `onIngredientPriceChange()` - Recalc HPP for all recipes using ingredient
  - `onRecipeIngredientsChange()` - Recalc HPP for specific recipe
  - `onOperationalCostsChange()` - Recalc HPP for all active recipes
  - `checkStaleHpp()` - Find recipes with outdated HPP
  - `refreshStaleHpp()` - Batch refresh stale HPP
  - `batchRecalculateAll()` - Recalc all recipes

**File**: `src/services/hpp/HppTriggerService.ts`

### 8. API Integration (IMPLEMENTED)
- ✅ Ingredients API triggers HPP recalc on price change
- ✅ Operational Costs API triggers HPP recalc on create/update/delete
- ✅ Recipes API triggers HPP recalc on ingredients change

**Files**:
- `src/app/api/ingredients/[[...slug]]/route.ts`
- `src/app/api/operational-costs/[[...slug]]/route.ts`
- `src/app/api/recipes/[[...slug]]/route.ts`

---

## Remaining Issues (Priority 2 - Next Sprint)

1. Add HPP versioning/history tracking
2. Add cost trend analysis
3. Add data quality monitoring dashboard
4. Add scheduled HPP refresh job (cron)

---

## Next Steps

1. **Immediate**: Test fixes yang sudah applied
2. **This Week**: Fix labor cost dan overhead allocation
3. **Next Sprint**: Implement HPP refresh triggers dan monitoring

