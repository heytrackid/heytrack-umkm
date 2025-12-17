# Shared Component Opportunities - HeyTrack

**Analisis Tanggal:** 17 Desember 2025  
**Status:** Rekomendasi untuk Refactoring

## Executive Summary

Berdasarkan analisis mendalam terhadap codebase HeyTrack, ditemukan **beberapa peluang signifikan** untuk membuat shared components dan mengurangi duplikasi kode. Dokumen ini mengidentifikasi pola-pola yang berulang dan memberikan rekomendasi untuk refactoring.

---

## 🎯 Prioritas Tinggi - Immediate Action

### 1. **Alert/Notification Banner Component** ⭐⭐⭐

**Masalah:** Alert banner dengan pola yang sama diulang di berbagai halaman dengan variasi warna.

**Lokasi Duplikasi:**
- `@/app/ingredients/page.tsx` (2 instances - orange & blue alerts)
- `@/app/reports/components/InventoryReport.tsx` (orange & red alerts)
- `@/app/settings/components/UnsavedChangesPrompt.tsx` (orange alert)

**Pola yang Berulang:**
```tsx
<div className="rounded-xl border border-{color}-200 bg-{color}-50/50 p-4 dark:bg-{color}-900/10 dark:border-{color}-900/30">
  <div className="flex flex-col sm:flex-row items-start gap-4">
    <div className="p-2 bg-{color}-100 dark:bg-{color}-900/30 rounded-lg shrink-0">
      <AlertTriangle className="w-5 h-5 text-{color}-600 dark:text-{color}-400" />
    </div>
    <div className="flex-1 space-y-1 min-w-0">
      <h3 className="font-semibold text-{color}-900 dark:text-{color}-200 text-sm">{title}</h3>
      <p className="text-sm text-{color}-700 dark:text-{color}-300/90 leading-relaxed">
        {message}
      </p>
    </div>
    <Button size="sm" variant="outline" className="shrink-0 w-full sm:w-auto">
      {actionLabel}
    </Button>
  </div>
</div>
```

**Rekomendasi:**
Buat shared component `AlertBanner` di `@/components/shared/AlertBanner.tsx`:

```tsx
interface AlertBannerProps {
  variant: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string | ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  icon?: LucideIcon
  className?: string
}

export const AlertBanner = ({ 
  variant, 
  title, 
  message, 
  action,
  icon: Icon = AlertTriangle,
  className 
}: AlertBannerProps) => {
  const variants = {
    info: {
      container: 'border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/30',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-900 dark:text-blue-200',
      message: 'text-blue-700 dark:text-blue-300/90',
      button: 'bg-white/50 border-blue-200 hover:bg-white text-blue-700'
    },
    warning: {
      container: 'border-orange-200 bg-orange-50/50 dark:bg-orange-900/10 dark:border-orange-900/30',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      icon: 'text-orange-600 dark:text-orange-400',
      title: 'text-orange-900 dark:text-orange-200',
      message: 'text-orange-700 dark:text-orange-300/90',
      button: 'bg-white/50 border-orange-200 hover:bg-white text-orange-700'
    },
    error: {
      container: 'border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/30',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      icon: 'text-red-600 dark:text-red-400',
      title: 'text-red-900 dark:text-red-200',
      message: 'text-red-700 dark:text-red-300/90',
      button: 'bg-white/50 border-red-200 hover:bg-white text-red-700'
    },
    success: {
      container: 'border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-900/30',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      icon: 'text-green-600 dark:text-green-400',
      title: 'text-green-900 dark:text-green-200',
      message: 'text-green-700 dark:text-green-300/90',
      button: 'bg-white/50 border-green-200 hover:bg-white text-green-700'
    }
  }
  
  const styles = variants[variant]
  
  return (
    <div className={cn('rounded-xl border p-4', styles.container, className)}>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className={cn('p-2 rounded-lg shrink-0', styles.iconBg)}>
          <Icon className={cn('w-5 h-5', styles.icon)} />
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          <h3 className={cn('font-semibold text-sm', styles.title)}>{title}</h3>
          <div className={cn('text-sm leading-relaxed', styles.message)}>
            {message}
          </div>
        </div>
        {action && (
          <Button 
            size="sm" 
            variant="outline" 
            className={cn('shrink-0 w-full sm:w-auto', styles.button)}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}
```

**Usage Example:**
```tsx
// Before
<div className="rounded-xl border border-orange-200...">...</div>

// After
<AlertBanner
  variant="warning"
  title="Perhatian Diperlukan"
  message={`${outOfStockCount} bahan habis dan ${lowStockCount} bahan stok menipis`}
  action={{
    label: "Buat Pesanan",
    onClick: () => router.push('/ingredients/purchases')
  }}
/>
```

**Estimasi Pengurangan Kode:** ~150 lines

---

### 2. **Entity Form Component (Generic CRUD Form)** ⭐⭐⭐

**Masalah:** Form untuk Customer dan Supplier memiliki struktur yang sangat mirip dengan pola yang sama.

**Lokasi Duplikasi:**
- `@/app/customers/components/CustomerForm.tsx` (347 lines)
- `@/app/suppliers/components/SupplierForm.tsx` (171 lines)
- `@/app/ingredients/purchases/components/PurchaseForm.tsx`

**Pola yang Sama:**
- Form validation dengan Zod
- React Hook Form integration
- Section-based layout (Basic Info, Additional Info, Notes, Status)
- Loading states dengan mutation
- Error handling
- Cancel/Submit buttons

**Rekomendasi:**
Buat generic form component di `@/components/shared/EntityForm.tsx`:

```tsx
interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'switch'
  icon?: LucideIcon
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[] // for select
  min?: number
  max?: number
  step?: number
  rows?: number // for textarea
  validation?: z.ZodType<any>
}

interface FormSection {
  title: string
  description?: string
  fields: FormField[]
}

interface EntityFormProps<T> {
  title: string
  description?: string
  sections: FormSection[]
  defaultValues?: Partial<T>
  onSubmit: (data: T) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
  cancelLabel?: string
  schema: z.ZodType<T>
}

export function EntityForm<T extends Record<string, any>>({
  title,
  description,
  sections,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel = 'Simpan',
  cancelLabel = 'Batal',
  schema
}: EntityFormProps<T>) {
  // Implementation with react-hook-form and zod
}
```

**Usage Example:**
```tsx
// Before: CustomerForm.tsx (347 lines)

// After:
const customerSections: FormSection[] = [
  {
    title: 'Informasi Dasar',
    fields: [
      { name: 'name', label: 'Nama Pelanggan', type: 'text', icon: User, required: true },
      { name: 'phone', label: 'Nomor Telepon', type: 'tel', icon: Phone },
      { name: 'email', label: 'Email', type: 'email', icon: Mail },
      { name: 'address', label: 'Alamat', type: 'textarea', icon: MapPin, rows: 3 }
    ]
  },
  {
    title: 'Tipe & Diskon',
    fields: [
      { 
        name: 'customer_type', 
        label: 'Tipe Pelanggan', 
        type: 'select', 
        icon: Tag,
        options: [
          { value: 'regular', label: 'Regular' },
          { value: 'retail', label: 'Retail' },
          { value: 'wholesale', label: 'Grosir' },
          { value: 'vip', label: 'VIP' }
        ]
      },
      { name: 'discount_percentage', label: 'Diskon (%)', type: 'number', icon: Percent, min: 0, max: 100 }
    ]
  }
]

<EntityForm
  title="Tambah Pelanggan"
  sections={customerSections}
  schema={CustomerFormSchema}
  onSubmit={handleSubmit}
  onCancel={onCancel}
  isLoading={mutation.isPending}
/>
```

**Estimasi Pengurangan Kode:** ~400 lines

---

### 3. **Delete Confirmation Modal** ⭐⭐

**Masalah:** DeleteModal digunakan di banyak tempat dengan pola yang sama.

**Lokasi Penggunaan:**
- `@/app/ingredients/purchases/components/IngredientPurchasesLayout.tsx`
- `@/app/customers/components/CustomersLayout.tsx`
- `@/app/suppliers/page.tsx`

**Status:** ✅ **SUDAH ADA** di `@/components/ui/index.ts` sebagai `DeleteModal`

**Rekomendasi:**
Pastikan semua file menggunakan shared `DeleteModal` dari `@/components/ui/index`:

```tsx
import { DeleteModal } from '@/components/ui/index'

// Usage
<DeleteModal
  isOpen={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  onConfirm={handleDelete}
  entityName="Pelanggan"
  itemName={itemToDelete?.name}
  isLoading={deleteMutation.isPending}
/>
```

**Action Required:** ✅ Sudah digunakan dengan benar

---

## 🎯 Prioritas Menengah - Should Consider

### 4. **Stats Card Patterns** ⭐⭐

**Status:** ✅ **SUDAH ADA** di `@/components/ui/stats-cards.tsx`

**Rekomendasi:**
Pastikan semua halaman menggunakan `StatsCards` dan `StatCardPatterns`:

**Files yang sudah menggunakan:**
- `@/app/ingredients/page.tsx` ✅
- `@/app/ingredients/purchases/components/PurchaseStats.tsx` ✅

**Files yang perlu dicek:**
- Cek apakah ada custom stats cards yang bisa diganti dengan `StatsCards`

---

### 5. **Data Table Component** ⭐⭐

**Status:** ✅ **SUDAH ADA** di `@/components/shared/SharedDataTable.tsx`

**Rekomendasi:**
Pastikan semua tabel menggunakan `SharedDataTable`:

**Files yang sudah menggunakan:**
- `@/app/suppliers/page.tsx` ✅

**Files yang perlu dicek:**
- Cek apakah ada custom table implementations yang bisa diganti

---

### 6. **Empty State Component** ⭐

**Status:** ✅ **SUDAH ADA** di `@/components/shared/DataComponents.tsx`

**Rekomendasi:**
Gunakan `EmptyState` dari shared components untuk konsistensi:

```tsx
import { EmptyState } from '@/components/shared'

<EmptyState
  icon={Package}
  title="Belum Ada Data"
  description="Mulai dengan menambahkan item pertama"
  action={{
    label: "Tambah Item",
    onClick: () => setDialogOpen(true)
  }}
/>
```

---

## 🎯 Prioritas Rendah - Nice to Have

### 7. **Loading States** ⭐

**Status:** ✅ **SUDAH ADA** di `@/components/shared/DataComponents.tsx`

**Components Available:**
- `TableSkeleton`
- `CardSkeleton`
- `FormSkeleton`

**Rekomendasi:**
Gunakan skeleton components yang sudah ada untuk loading states yang konsisten.

---

### 8. **Page Header Component** ⭐

**Status:** ✅ **SUDAH ADA** di `@/components/layout/PageHeader.tsx`

**Rekomendasi:**
Semua halaman sudah menggunakan `PageHeader` dengan baik. ✅

---

## 📊 Summary & Impact Analysis

### Komponen yang Perlu Dibuat (New)

| Component | Priority | Estimated LOC Saved | Effort | Impact |
|-----------|----------|---------------------|--------|--------|
| AlertBanner | ⭐⭐⭐ High | ~150 lines | 2-3 hours | High |
| EntityForm (Generic) | ⭐⭐⭐ High | ~400 lines | 4-6 hours | Very High |

**Total Estimated Savings:** ~550 lines of code  
**Total Effort:** 6-9 hours  
**Maintainability Improvement:** Very High

### Komponen yang Sudah Ada (Existing) ✅

| Component | Location | Status |
|-----------|----------|--------|
| DeleteModal | `@/components/ui/index` | ✅ Used correctly |
| StatsCards | `@/components/ui/stats-cards.tsx` | ✅ Used correctly |
| SharedDataTable | `@/components/shared/SharedDataTable.tsx` | ✅ Used correctly |
| EmptyState | `@/components/shared/DataComponents.tsx` | ✅ Available |
| PageHeader | `@/components/layout/PageHeader.tsx` | ✅ Used correctly |
| Skeletons | `@/components/shared/DataComponents.tsx` | ✅ Available |

---

## 🚀 Implementation Roadmap

### Phase 1: High Priority (Week 1)
1. ✅ Create `AlertBanner` component
2. ✅ Refactor `@/app/ingredients/page.tsx` to use `AlertBanner`
3. ✅ Refactor other pages with alert patterns

### Phase 2: High Priority (Week 2)
1. ✅ Create `EntityForm` generic component
2. ✅ Refactor `CustomerForm` to use `EntityForm`
3. ✅ Refactor `SupplierForm` to use `EntityForm`

### Phase 3: Validation & Testing (Week 3)
1. ✅ Test all refactored components
2. ✅ Ensure no regressions
3. ✅ Update documentation

---

## 📝 Code Quality Improvements

### Additional Recommendations

1. **Consistent Import Patterns**
   - Use barrel exports from `@/components/shared/index.ts`
   - Avoid direct imports from component files

2. **Type Safety**
   - All shared components should have proper TypeScript interfaces
   - Use generics where applicable (like `EntityForm<T>`)

3. **Documentation**
   - Add JSDoc comments to all shared components
   - Include usage examples in component files

4. **Testing**
   - Add unit tests for shared components
   - Add integration tests for critical flows

---

## ✅ Conclusion

Codebase HeyTrack sudah **cukup baik** dalam menggunakan shared components yang ada. Namun, ada **2 peluang besar** untuk improvement:

1. **AlertBanner Component** - Akan mengurangi duplikasi alert patterns
2. **EntityForm Component** - Akan significantly mengurangi boilerplate form code

**Recommended Next Steps:**
1. Implement `AlertBanner` component (2-3 hours)
2. Implement `EntityForm` component (4-6 hours)
3. Refactor existing code to use new components (2-3 hours)

**Total Time Investment:** ~8-12 hours  
**Long-term Benefit:** Reduced maintenance, better consistency, easier to add new features

---

**Generated:** 17 Desember 2025  
**Reviewed By:** AI Code Analyzer  
**Status:** Ready for Implementation
