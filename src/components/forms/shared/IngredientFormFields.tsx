/**
 * Shared Form Fields Components
 * Reusable form field components to reduce duplicate code
 */

import { FormField, FormGrid, FormSection } from '@/components/ui/crud-form'

interface IngredientFormFieldsProps {
  register: any
  errors: any
  unitOptions?: Array<{ value: string; label: string }>
  showDescription?: boolean
  showCategory?: boolean
  showSupplier?: boolean
}

/**
 * Basic ingredient information fields (name, unit)
 */
export function IngredientBasicFields({
  register,
  errors,
  unitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'l', label: 'Liter (l)' },
    { value: 'ml', label: 'Mililiter (ml)' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'dozen', label: 'Lusin (dozen)' },
  ]
}: IngredientFormFieldsProps) {
  return (
    <FormSection
      title="Informasi Dasar"
      description="Masukkan informasi dasar bahan baku"
    >
      <FormGrid cols={2}>
        <FormField
          label="Nama Bahan"
          name="name"
          type="text"
          {...register('name')}
          error={errors.name?.message}
          required
          hint="Nama bahan baku yang mudah dikenali"
        />

        <FormField
          label="Satuan"
          name="unit"
          type="select"
          {...register('unit')}
          error={errors.unit?.message}
          required
          options={unitOptions}
          hint="Pilih satuan yang sesuai"
        />
      </FormGrid>
    </FormSection>
  )
}

/**
 * Price and stock fields (price, current stock, min stock)
 */
export function IngredientPriceStockFields({
  register,
  errors
}: IngredientFormFieldsProps) {
  return (
    <FormSection
      title="Harga & Stok"
      description="Atur harga dan stok bahan baku"
    >
      <FormField
        label="Harga per Unit"
        name="price_per_unit"
        type="number"
        {...register('price_per_unit', { valueAsNumber: true })}
        error={errors.price_per_unit?.message}
        required
        min={0}
        step={0.01}
        hint="Harga per satuan dalam Rupiah"
      />

      <FormGrid cols={2}>
        <FormField
          label="Stok Saat Ini"
          name="current_stock"
          type="number"
          {...register('current_stock', { valueAsNumber: true })}
          error={errors.current_stock?.message}
          required
          min={0}
          step={0.01}
          hint="Jumlah stok yang tersedia sekarang"
        />

        <FormField
          label="Stok Minimum"
          name="min_stock"
          type="number"
          {...register('min_stock', { valueAsNumber: true })}
          error={errors.min_stock?.message}
          required
          min={0}
          step={0.01}
          hint="Batas minimum untuk alert stok"
        />
      </FormGrid>
    </FormSection>
  )
}

/**
 * Optional fields (description, category, supplier)
 */
export function IngredientOptionalFields({
  register,
  errors,
  showDescription = true,
  showCategory = false,
  showSupplier = false
}: IngredientFormFieldsProps) {
  const fields = []

  if (showDescription) {
    fields.push(
      <FormField
        key="description"
        label="Deskripsi"
        name="description"
        type="text"
        {...register('description')}
        hint="Deskripsi atau catatan tambahan (opsional)"
      />
    )
  }

  if (showCategory) {
    fields.push(
      <FormField
        key="category"
        label="Kategori"
        name="category"
        type="text"
        {...register('category')}
        hint="Kategori bahan baku (opsional)"
      />
    )
  }

  if (showSupplier) {
    fields.push(
      <FormField
        key="supplier"
        label="Supplier"
        name="supplier"
        type="text"
        {...register('supplier')}
        hint="Nama supplier (opsional)"
      />
    )
  }

  if (fields.length === 0) return null

  return (
    <FormSection title="Informasi Tambahan">
      {fields}
    </FormSection>
  )
}

/**
 * Complete ingredient form fields (combines all sections)
 */
export function IngredientFormFields(props: IngredientFormFieldsProps) {
  return (
    <>
      <IngredientBasicFields {...props} />
      <IngredientPriceStockFields {...props} />
      <IngredientOptionalFields {...props} />
    </>
  )
}
