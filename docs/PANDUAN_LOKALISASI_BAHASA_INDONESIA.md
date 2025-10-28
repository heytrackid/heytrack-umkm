# 📚 Panduan Lokalisasi UI ke Bahasa Indonesia UMKM

## 🎯 Tujuan
Mengubah semua teks UI dari Bahasa Inggris ke Bahasa Indonesia yang mudah dimengerti oleh pelaku UMKM, dengan tooltip untuk istilah teknis.

---

## ✅ Yang Sudah Dibuat

### 1. Tooltip Helper Component
**File:** `src/components/ui/tooltip-helper.tsx`

**Komponen:**
- `TooltipHelper` - Tooltip dengan icon bantuan
- `LabelWithTooltip` - Label form dengan tooltip
- `UMKM_TOOLTIPS` - Kamus istilah teknis

**Cara Pakai:**
```tsx
import { TooltipHelper, LabelWithTooltip, UMKM_TOOLTIPS } from '@/components/ui/tooltip-helper'

// 1. Label dengan tooltip
<LabelWithTooltip 
  label="HPP per Porsi"
  tooltip={UMKM_TOOLTIPS.hpp}
  required
/>

// 2. Tooltip manual
<TooltipHelper content="Harga rata-rata bahan baku">
  <span>WAC</span>
</TooltipHelper>

// 3. Tooltip tanpa icon
<TooltipHelper content="Penjelasan" showIcon={false}>
  <Button>Hover me</Button>
</TooltipHelper>
```

### 2. Konfigurasi Bahasa Indonesia
**File:** `src/lib/i18n/umkm-id.ts`

**Fitur:**
- Semua teks UI terpusat
- Placeholder support: `{item}`, `{quantity}`, dll
- Helper function `t()` untuk teks dengan parameter

**Cara Pakai:**
```tsx
import { UMKM_ID, t } from '@/lib/i18n/umkm-id'

// 1. Akses langsung
<Button>{UMKM_ID.common.save}</Button>
// Output: "Simpan"

// 2. Dengan parameter
<p>{t('alerts.lowStock', { item: 'Tepung', quantity: '5', unit: 'kg' })}</p>
// Output: "Stok Tepung menipis! Sisa 5 kg"

// 3. Nested access
<h1>{UMKM_ID.orders.title}</h1>
// Output: "Kelola Pesanan"
```

---

## 📝 Checklist Update Manual

### ✅ Dashboard (DONE)
- [x] Header: "HeyTrack" → "Beranda"
- [x] Quick Actions: "Aksi Cepat" → "Menu Cepat"
- [x] Menu items sudah Bahasa Indonesia
- [x] Welcome message lebih friendly

### 🔄 Orders (Perlu Update)
**File:** `src/app/orders/page.tsx`

**Yang Perlu Diubah:**
```tsx
// BEFORE
<PageHeader
  title="Kelola Pesanan"  // ✅ Sudah OK
  description="Terima dan proses pesanan dari pelanggan"  // ✅ Sudah OK
/>

// Stats labels - perlu tambah tooltip
<SharedStatsCards
  stats={[
    {
      title: 'Total Pesanan',  // ✅ OK
      value: stats.totalOrders,
      icon: <ShoppingCart />
    },
    {
      title: 'Menunggu Proses',  // ✅ OK
      value: stats.pendingOrders,
      icon: <Clock />
    },
    {
      title: 'Selesai',  // ✅ OK
      value: stats.completedOrders,
      icon: <CheckCircle />
    },
    {
      title: 'Rata-rata Nilai',  // ✅ OK
      value: `Rp ${Math.round(stats.averageOrderValue).toLocaleString()}`,
      icon: <TrendingUp />
    }
  ]}
/>
```

**File:** `src/components/orders/EnhancedOrderForm.tsx`

**Yang Perlu Diubah:**
```tsx
// Tambahkan tooltip untuk istilah teknis
import { LabelWithTooltip, UMKM_TOOLTIPS } from '@/components/ui/tooltip-helper'

// BEFORE
<label>Status Pesanan</label>

// AFTER
<LabelWithTooltip 
  label="Status Pesanan"
  tooltip={UMKM_TOOLTIPS.orderStatus}
/>

// BEFORE
<label>Status Pembayaran</label>

// AFTER
<LabelWithTooltip 
  label="Status Pembayaran"
  tooltip={UMKM_TOOLTIPS.paymentStatus}
/>

// BEFORE
<label>Prioritas</label>

// AFTER
<LabelWithTooltip 
  label="Prioritas"
  tooltip={UMKM_TOOLTIPS.priority}
/>
```

### 🔄 Ingredients (Perlu Update)
**File:** `src/app/ingredients/page.tsx`
**File:** `src/components/ingredients/EnhancedIngredientForm.tsx`

**Yang Perlu Diubah:**
```tsx
// Tambahkan tooltip
<LabelWithTooltip 
  label="Stok Saat Ini"
  tooltip={UMKM_TOOLTIPS.stock}
  required
/>

<LabelWithTooltip 
  label="Titik Pesan Ulang"
  tooltip={UMKM_TOOLTIPS.reorderPoint}
/>

<LabelWithTooltip 
  label="Stok Minimum"
  tooltip={UMKM_TOOLTIPS.minStock}
/>

<LabelWithTooltip 
  label="Waktu Tunggu (hari)"
  tooltip={UMKM_TOOLTIPS.leadTime}
/>

// Placeholder sudah OK:
placeholder="Contoh: Tepung Terigu, Gula Pasir"
```

### 🔄 Recipes (Perlu Update)
**File:** `src/app/recipes/page.tsx`

**Yang Perlu Diubah:**
```tsx
<LabelWithTooltip 
  label="Jumlah Porsi"
  tooltip={UMKM_TOOLTIPS.servings}
  required
/>

<LabelWithTooltip 
  label="Waktu Persiapan"
  tooltip={UMKM_TOOLTIPS.prepTime}
/>

<LabelWithTooltip 
  label="Waktu Memasak"
  tooltip={UMKM_TOOLTIPS.cookTime}
/>

// Button text
<Button>Buat Resep Baru</Button>  // ✅ OK
<Button>Simpan Resep</Button>     // ✅ OK
```

### 🔄 HPP (Perlu Update)
**File:** `src/app/hpp/page.tsx`
**File:** `src/modules/hpp/components/UnifiedHppPage.tsx`

**Yang Perlu Diubah:**
```tsx
// Title dengan tooltip
<div className="flex items-center gap-2">
  <h1>Biaya Produksi</h1>
  <TooltipHelper content={UMKM_TOOLTIPS.hpp} />
</div>

// Labels dengan tooltip
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

// Stats cards
{
  title: 'Biaya Bahan Baku',  // ✅ OK
  subtitle: 'Material Cost',  // ❌ Hapus atau ganti
}

{
  title: 'Biaya Tenaga Kerja',  // ✅ OK
  subtitle: 'Labor Cost',  // ❌ Hapus
}

{
  title: 'Biaya Operasional',  // ✅ OK
  subtitle: 'Overhead',  // ❌ Hapus
}
```

### 🔄 Reports (Perlu Update)
**File:** `src/app/reports/page.tsx`

**Yang Perlu Diubah:**
```tsx
// Tabs
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
```

### 🔄 Customers (Perlu Update)
**File:** `src/app/customers/page.tsx`

**Yang Perlu Diubah:**
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
```

---

## 🎨 Pattern Update yang Konsisten

### 1. Button Text
```tsx
// ❌ BEFORE
<Button>Save</Button>
<Button>Cancel</Button>
<Button>Delete</Button>
<Button>Add New</Button>

// ✅ AFTER
<Button>Simpan</Button>
<Button>Batal</Button>
<Button>Hapus</Button>
<Button>Tambah Baru</Button>
```

### 2. Form Labels dengan Tooltip
```tsx
// ❌ BEFORE
<label>HPP per Unit</label>

// ✅ AFTER
<LabelWithTooltip 
  label="HPP per Porsi"
  tooltip="Total biaya untuk membuat 1 porsi produk"
  required
/>
```

### 3. Placeholder Text
```tsx
// ❌ BEFORE
placeholder="Enter ingredient name"

// ✅ AFTER
placeholder="Contoh: Tepung Terigu, Gula Pasir"
```

### 4. Status & Enum
```tsx
// ❌ BEFORE
status: {
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled"
}

// ✅ AFTER
status: {
  pending: "Menunggu",
  completed: "Selesai",
  cancelled: "Dibatalkan"
}
```

### 5. Confirmation Messages
```tsx
// ❌ BEFORE
confirm('Are you sure you want to delete this item?')

// ✅ AFTER
confirm('Yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan!')
```

### 6. Toast Messages
```tsx
// ❌ BEFORE
toast({
  title: "Success",
  description: "Order created successfully"
})

// ✅ AFTER
toast({
  title: "Berhasil",
  description: "Pesanan berhasil dibuat"
})
```

---

## 🔍 Cara Cari Text yang Perlu Diubah

### 1. Cari Button Text
```bash
grep -r "Button.*children" src/
grep -r "<Button>" src/ | grep -v "Bahasa Indonesia"
```

### 2. Cari Label
```bash
grep -r "label=" src/
grep -r "<label>" src/
```

### 3. Cari Placeholder
```bash
grep -r "placeholder=" src/
```

### 4. Cari Title/Heading
```bash
grep -r "title=" src/
grep -r "<h1>" src/
grep -r "<h2>" src/
```

### 5. Cari Toast/Alert Messages
```bash
grep -r "toast({" src/
grep -r "alert(" src/
```

---

## 📋 Priority Update List

### High Priority (User-facing, sering dipakai)
1. ✅ Dashboard - DONE
2. 🔄 Orders page & form
3. 🔄 Ingredients page & form
4. 🔄 Recipes page & form
5. 🔄 HPP calculator
6. 🔄 Reports

### Medium Priority
7. 🔄 Customers page
8. 🔄 Production page
9. 🔄 Settings page
10. 🔄 Navigation/Sidebar

### Low Priority (Admin/Technical)
11. 🔄 Error messages
12. 🔄 Loading states
13. 🔄 Validation messages

---

## 💡 Tips & Best Practices

### 1. Gunakan Bahasa Sehari-hari
```tsx
// ❌ Terlalu formal
"Silakan melakukan input data terlebih dahulu"

// ✅ Natural
"Isi data dulu ya"
```

### 2. Hindari Istilah Teknis Tanpa Penjelasan
```tsx
// ❌ Tanpa tooltip
<label>WAC</label>

// ✅ Dengan tooltip
<LabelWithTooltip 
  label="Harga Rata-rata (WAC)"
  tooltip="Harga rata-rata bahan baku berdasarkan pembelian terakhir"
/>
```

### 3. Berikan Contoh di Placeholder
```tsx
// ❌ Tidak jelas
placeholder="Enter name"

// ✅ Jelas dengan contoh
placeholder="Contoh: Kue Brownies, Nasi Goreng"
```

### 4. Confirmation yang Jelas
```tsx
// ❌ Terlalu singkat
confirm('Delete?')

// ✅ Jelas dan ada warning
confirm('Yakin ingin menghapus pesanan ini? Data tidak bisa dikembalikan!')
```

### 5. Success Message yang Friendly
```tsx
// ❌ Kaku
"Data has been saved successfully"

// ✅ Friendly
"Yeay! Data berhasil disimpan 🎉"
```

---

## 🚀 Quick Start Update

### Step 1: Import Components
```tsx
import { TooltipHelper, LabelWithTooltip, UMKM_TOOLTIPS } from '@/components/ui/tooltip-helper'
import { UMKM_ID, t } from '@/lib/i18n/umkm-id'
```

### Step 2: Replace Labels
```tsx
// Find all <label> tags
// Replace with <LabelWithTooltip> if needed

// BEFORE
<label className="text-sm font-medium">
  HPP per Unit
</label>

// AFTER
<LabelWithTooltip 
  label="HPP per Porsi"
  tooltip={UMKM_TOOLTIPS.hpp}
  className="text-sm font-medium"
/>
```

### Step 3: Replace Button Text
```tsx
// Use UMKM_ID config
<Button>{UMKM_ID.common.save}</Button>
<Button>{UMKM_ID.common.cancel}</Button>
<Button>{UMKM_ID.common.delete}</Button>
```

### Step 4: Replace Messages
```tsx
// Use t() function for dynamic messages
toast({
  title: UMKM_ID.success.created.replace('{item}', 'Pesanan'),
  description: "Pesanan berhasil dibuat"
})
```

---

## ✅ Checklist Per File

### Orders
- [ ] `src/app/orders/page.tsx` - Page title & breadcrumb
- [ ] `src/components/orders/EnhancedOrderForm.tsx` - Form labels & tooltips
- [ ] `src/components/orders/OrderFilters.tsx` - Filter labels
- [ ] `src/components/orders/OrdersList.tsx` - Table headers
- [ ] `src/components/orders/OrderDetailView.tsx` - Detail labels

### Ingredients
- [ ] `src/app/ingredients/page.tsx` - Page title
- [ ] `src/components/ingredients/EnhancedIngredientForm.tsx` - Form labels & tooltips
- [ ] `src/app/api/ingredient-purchases/route.ts` - API messages (sudah OK)

### Recipes
- [ ] `src/app/recipes/page.tsx` - Page title
- [ ] `src/app/recipes/ai-generator/page.tsx` - AI generator labels
- [ ] Recipe form components - Form labels & tooltips

### HPP
- [ ] `src/app/hpp/page.tsx` - Page title
- [ ] `src/modules/hpp/components/UnifiedHppPage.tsx` - HPP labels & tooltips
- [ ] HPP calculator components - Calculation labels

### Reports
- [ ] `src/app/reports/page.tsx` - Report types & periods
- [ ] Report components - Chart labels

---

## 📞 Need Help?

Jika ada yang bingung atau perlu bantuan:
1. Check `UMKM_TOOLTIPS` di `src/components/ui/tooltip-helper.tsx`
2. Check `UMKM_ID` di `src/lib/i18n/umkm-id.ts`
3. Lihat contoh di Dashboard yang sudah diupdate

---

**Last Updated:** 2025-01-XX
**Status:** 🔄 In Progress
**Progress:** Dashboard ✅ | Orders 🔄 | Ingredients 🔄 | Recipes 🔄 | HPP 🔄
