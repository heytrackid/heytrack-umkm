'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ingredientSchema, type IngredientFormData } from '@/lib/validations/ingredients'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

interface IngredientFormProps {
  defaultValues?: Partial<IngredientFormData>
  onSubmit: (data: IngredientFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function IngredientForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: IngredientFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: defaultValues || {
      current_stock: 0,
      min_stock: 0,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Bahan Baku *</Label>
        <Input id="name" {...register('name')} placeholder="Contoh: Tepung Terigu" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Kategori</Label>
          <Input id="category" {...register('category')} placeholder="Contoh: Bahan Kering" />
          {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Satuan *</Label>
          <Input id="unit" {...register('unit')} placeholder="Contoh: kg, liter, pcs" />
          {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price_per_unit">Harga per Satuan *</Label>
          <Input
            id="price_per_unit"
            type="number"
            step="0.01"
            {...register('price_per_unit', { valueAsNumber: true })}
            placeholder="0"
          />
          {errors.price_per_unit && (
            <p className="text-sm text-destructive">{errors.price_per_unit.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_stock">Stok Saat Ini</Label>
          <Input
            id="current_stock"
            type="number"
            step="0.01"
            {...register('current_stock', { valueAsNumber: true })}
            placeholder="0"
          />
          {errors.current_stock && (
            <p className="text-sm text-destructive">{errors.current_stock.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="min_stock">Stok Minimum</Label>
        <Input
          id="min_stock"
          type="number"
          step="0.01"
          {...register('min_stock', { valueAsNumber: true })}
          placeholder="0"
        />
        {errors.min_stock && (
          <p className="text-sm text-destructive">{errors.min_stock.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplier">Supplier</Label>
        <Input id="supplier" {...register('supplier')} placeholder="Nama supplier (opsional)" />
        {errors.supplier && <p className="text-sm text-destructive">{errors.supplier.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Catatan</Label>
        <Input id="description" {...register('description')} placeholder="Catatan tambahan (opsional)" />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}
