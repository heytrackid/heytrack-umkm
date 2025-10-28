# ✅ Lokalisasi UI - Updates Applied

## Summary
Dokumentasi perubahan yang sudah diterapkan untuk lokalisasi UI ke Bahasa Indonesia UMKM.

---

## ✅ COMPLETED

### 1. Dashboard (`src/app/dashboard/page.tsx`)
**Changes:**
- ✅ Title: "HeyTrack" → "Beranda"
- ✅ Welcome message: More friendly dengan emoji 👋
- ✅ Quick Actions: "Aksi Cepat" → "Menu Cepat"
- ✅ Menu items:
  - "Inventory" → "Bahan Baku"
  - "HPP" → "Biaya Produksi"
  - Semua sudah Bahasa Indonesia

**Status:** ✅ DONE

---

### 2. Tooltip & i18n Infrastructure
**Files Created:**
- ✅ `src/components/ui/tooltip-helper.tsx` - Tooltip components
- ✅ `src/lib/i18n/umkm-id.ts` - Konfigurasi Bahasa Indonesia lengkap
- ✅ `docs/PANDUAN_LOKALISASI_BAHASA_INDONESIA.md` - Panduan lengkap

**Features:**
- ✅ `TooltipHelper` component dengan icon bantuan
- ✅ `LabelWithTooltip` untuk form labels
- ✅ `UMKM_TOOLTIPS` dengan 20+ istilah teknis
- ✅ `UMKM_ID` dengan 500+ teks UI
- ✅ Helper function `t()` untuk dynamic text

**Status:** ✅ DONE

---

## 🔄 IN PROGRESS / READY TO APPLY

### 3. Orders Components

#### Already Good (Bahasa Indonesia):
- ✅ "Informasi Pelanggan"
- ✅ "Informasi Pengiriman"
- ✅ "Cari Produk"
- ✅ "Item Pesanan"
- ✅ Placeholders sudah Bahasa Indonesia
- ✅ Button text sudah Bahasa Indonesia

#### Need Tooltip Addition:
```tsx
// File: src/components/orders/EnhancedOrderForm.tsx

// Add imports
import { LabelWithTooltip, UMKM_TOOLTIPS } from '@/components/ui/tooltip-helper'

// Replace these labels:

// Line ~300: Priority
<Label htmlFor="priority">Prioritas</Label>
// CHANGE TO:
<LabelWithTooltip 
  label="Prioritas"
  tooltip="Tingkat kepentingan pesanan: Biasa (low), Standar (normal), Penting/Mendesak (high)"
/>

// Line ~320: Delivery Date
<Label htmlFor="delivery_date">Tanggal Pengiriman</Label>
// CHANGE TO:
<LabelWithTooltip 
  label="Tanggal Pengiriman"
  tooltip="Kapan pesanan ini harus dikirim ke pelanggan"
  required
/>

// Line ~340: Delivery Time
<Label htmlFor="delivery_time">Jam Pengiriman</Label>
// CHANGE TO:
<LabelWithTooltip 
  label="Jam Pengiriman"
  tooltip="Jam berapa pesanan harus sampai"
/>
```

**Status:** 🔄 Ready to apply (just add tooltips)

---

### 4. Ingredients Components

#### File: `src/components/ingredients/EnhancedIngredientForm.tsx`

**Current Status:** Mostly Bahasa Indonesia

**Need Updates:**
```tsx
// Add imports
import { LabelWithTooltip, UMKM_TOOLTIPS } from '@/components/ui/tooltip-helper'

// Replace labels with tooltips:

<LabelWithTooltip 
  label="Stok Saat Ini"
  tooltip={UMKM_TOOLTIPS.stock}
  required
/>

<LabelWithTooltip 
  label="Stok Minimum"
  tooltip={UMKM_TOOLTIPS.minStock}
/>

<LabelWithTooltip 
  label="Titik Pesan Ulang"
  tooltip={UMKM_TOOLTIPS.reorderPoint}
/>

<LabelWithTooltip 
  label="Waktu Tunggu Supplier (hari)"
  tooltip={UMKM_TOOLTIPS.leadTime}
/>

<LabelWithTooltip 
  label="Harga per Satuan"
  tooltip="Harga beli bahan baku per satuan (kg, liter, dll)"
  required
/>
```

**Status:** 🔄 Ready to apply

---

### 5. HPP Components

#### File: `src/modules/hpp/components/UnifiedHppPage.tsx`

**Need Updates:**
```tsx
// Add imports
import { TooltipHelper, LabelWithTooltip, UMKM_TOOLTIPS } from '@/components/ui/tooltip-helper'

// Page title with tooltip
<div className="flex items-center gap-2">
  <h1 className="text-2xl font-bold">Biaya Produksi</h1>
  <TooltipHelper content={UMKM_TOOLTIPS.hpp} />
</div>

// Stats cards - remove English subtitles
{
  title: 'Biaya Bahan Baku',
  // subtitle: 'Material Cost',  // ❌ REMOVE
  value: formatCurrency(materialCost)
}

{
  title: 'Biaya Tenaga Kerja',
  // subtitle: 'Labor Cost',  // ❌ REMOVE
  value: formatCurrency(laborCost)
}

{
  title: 'Biaya Operasional',
  // subtitle: 'Overhead',  // ❌ REMOVE
  value: formatCurrency(overheadCost)
}

// Labels with tooltips
<LabelWithTooltip 
  label="HPP per Porsi"
  tooltip="Total biaya untuk membuat 1 porsi produk (bahan + tenaga + operasional)"
/>

<LabelWithTooltip 
  label="Harga Rata-rata (WAC)"
  tooltip={UMKM_TOOLTIPS.wac}
/>

<LabelWithTooltip 
  label="Margin Keuntungan"
  tooltip={UMKM_TOOLTIPS.margin}
/>
```

**Status:** 🔄 Ready to apply

---

### 6. Recipes Components

#### File: `src/app/recipes/page.tsx` & form components

**Need Updates:**
```tsx
// Add tooltips for technical terms

<LabelWithTooltip 
  label="Jumlah Porsi"
  tooltip={UMKM_TOOLTIPS.servings}
  required
/>

<LabelWithTooltip 
  label="Waktu Persiapan (menit)"
  tooltip={UMKM_TOOLTIPS.prepTime}
/>

<LabelWithTooltip 
  label="Waktu Memasak (menit)"
  tooltip={UMKM_TOOLTIPS.cookTime}
/>

<LabelWithTooltip 
  label="Harga Jual"
  tooltip="Harga jual produk ke pelanggan"
  required
/>

<LabelWithTooltip 
  label="Biaya Produksi"
  tooltip={UMKM_TOOLTIPS.hpp}
/>

<LabelWithTooltip 
  label="Keuntungan"
  tooltip={UMKM_TOOLTIPS.margin}
/>
```

**Status:** 🔄 Ready to apply

---

### 7. Reports Page

#### File: `src/app/reports/page.tsx`

**Need Updates:**
```tsx
// Tab labels - already good, just ensure consistency
<Tabs defaultValue="sales">
  <TabsList>
    <TabsTrigger value="sales">Penjualan</TabsTrigger>
    <TabsTrigger value="profit">Keuntungan</TabsTrigger>
    <TabsTrigger value="cashflow">Arus Kas</TabsTrigger>
    <TabsTrigger value="inventory">Stok Barang</TabsTrigger>
  </TabsList>
</Tabs>

// Period selector
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Pilih Periode" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="today">Hari Ini</SelectItem>
    <SelectItem value="week">Minggu Ini</SelectItem>
    <SelectItem value="month">Bulan Ini</SelectItem>
    <SelectItem value="year">Tahun Ini</SelectItem>
    <SelectItem value="custom">Pilih Tanggal</SelectItem>
  </SelectContent>
</Select>

// Export buttons
<Button>
  <Download className="mr-2 h-4 w-4" />
  Unduh Excel
</Button>

<Button>
  <FileText className="mr-2 h-4 w-4" />
  Unduh PDF
</Button>

// Add tooltips for metrics
<LabelWithTooltip 
  label="Total Penjualan"
  tooltip="Total uang yang masuk dari penjualan dalam periode ini"
/>

<LabelWithTooltip 
  label="Keuntungan Bersih"
  tooltip={UMKM_TOOLTIPS.profit}
/>

<LabelWithTooltip 
  label="Arus Kas"
  tooltip={UMKM_TOOLTIPS.cashFlow}
/>
```

**Status:** 🔄 Ready to apply

---

### 8. Customers Page

#### File: `src/app/customers/page.tsx`

**Need Updates:**
```tsx
<LabelWithTooltip 
  label="Tipe Pelanggan"
  tooltip={UMKM_TOOLTIPS.customerType}
/>

<LabelWithTooltip 
  label="Poin Loyalitas"
  tooltip={UMKM_TOOLTIPS.loyaltyPoints}
/>

// Customer type options
<Select>
  <SelectItem value="new">Pelanggan Baru</SelectItem>
  <SelectItem value="regular">Pelanggan Langganan</SelectItem>
  <SelectItem value="vip">Pelanggan VIP</SelectItem>
  <SelectItem value="inactive">Tidak Aktif</SelectItem>
</Select>

// Stats with tooltips
<LabelWithTooltip 
  label="Total Belanja"
  tooltip="Total uang yang sudah dibelanjakan pelanggan ini"
/>

<LabelWithTooltip 
  label="Pesanan Terakhir"
  tooltip="Kapan terakhir kali pelanggan ini pesan"
/>
```

**Status:** 🔄 Ready to apply

---

## 📊 Progress Summary

### Completed: 2/8 (25%)
- ✅ Dashboard
- ✅ Infrastructure (Tooltip & i18n)

### Ready to Apply: 6/8 (75%)
- 🔄 Orders (just add tooltips)
- 🔄 Ingredients (add tooltips)
- 🔄 HPP (add tooltips, remove English)
- 🔄 Recipes (add tooltips)
- 🔄 Reports (add tooltips)
- 🔄 Customers (add tooltips)

### Overall Progress: 25% Done, 75% Ready

---

## 🎯 Quick Apply Strategy

Karena sebagian besar sudah Bahasa Indonesia, tinggal:

1. **Add imports** di setiap file:
```tsx
import { LabelWithTooltip, UMKM_TOOLTIPS } from '@/components/ui/tooltip-helper'
```

2. **Replace `<Label>` dengan `<LabelWithTooltip>`** untuk istilah teknis

3. **Remove English subtitles** di stats cards

4. **Ensure consistency** di button text & placeholders

---

## 💡 Pattern to Follow

### Before:
```tsx
<Label htmlFor="hpp">HPP per Unit</Label>
<Input id="hpp" />
```

### After:
```tsx
<LabelWithTooltip 
  label="HPP per Porsi"
  tooltip={UMKM_TOOLTIPS.hpp}
  required
/>
<Input id="hpp" />
```

---

## 🚀 Next Actions

1. Apply tooltip updates to Orders form
2. Apply tooltip updates to Ingredients form
3. Apply tooltip updates to HPP page
4. Apply tooltip updates to Recipes form
5. Apply tooltip updates to Reports page
6. Apply tooltip updates to Customers page

**Estimated Time:** 30-45 minutes for all

---

**Last Updated:** 2025-01-XX
**Status:** Infrastructure ✅ | Dashboard ✅ | Forms 🔄 Ready
