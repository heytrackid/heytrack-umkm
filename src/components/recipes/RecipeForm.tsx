'use client'

import { RecipeIngredientSelector } from '@/components/recipes/RecipeIngredientSelector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { recipeSchema, type RecipeFormData } from '@/lib/validations/recipes'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

interface RecipeFormProps {
  defaultValues?: Partial<RecipeFormData>
  onSubmit: (data: RecipeFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function RecipeForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: RecipeFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: defaultValues || {
      ingredients: [],
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Resep *</Label>
          <Input id="name" {...register('name')} placeholder="Contoh: Nasi Goreng Spesial" aria-describedby={errors.name ? 'name-error' : undefined} />
          {errors.name && <p id="name-error" className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Input id="category" {...register('category')} placeholder="Contoh: Makanan Utama" aria-describedby={errors.category ? 'category-error' : undefined} />
            {errors.category && (
              <p id="category-error" className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="serving_size">Porsi</Label>
            <Input
              id="serving_size"
              type="number"
              {...register('serving_size', { valueAsNumber: true })}
              placeholder="1"
              aria-describedby={errors.serving_size ? 'serving_size-error' : undefined}
            />
            {errors.serving_size && (
              <p id="serving_size-error" className="text-sm text-destructive">{errors.serving_size.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Deskripsi singkat tentang resep ini..."
            rows={3}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && (
            <p id="description-error" className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="preparation_time">Waktu Persiapan (menit)</Label>
            <Input
              id="preparation_time"
              type="number"
              {...register('preparation_time', { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.preparation_time && (
              <p className="text-sm text-destructive">{errors.preparation_time.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cooking_time">Waktu Memasak (menit)</Label>
            <Input
              id="cooking_time"
              type="number"
              {...register('cooking_time', { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.cooking_time && (
              <p className="text-sm text-destructive">{errors.cooking_time.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Instruksi Pembuatan</Label>
          <Textarea
            id="instructions"
            {...register('instructions')}
            placeholder="Langkah-langkah pembuatan..."
            rows={5}
          />
          {errors.instructions && (
            <p className="text-sm text-destructive">{errors.instructions.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="selling_price">Harga Jual (opsional)</Label>
          <Input
            id="selling_price"
            type="number"
            step="0.01"
            {...register('selling_price', { valueAsNumber: true })}
            placeholder="0"
          />
          {errors.selling_price && (
            <p className="text-sm text-destructive">{errors.selling_price.message}</p>
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Bahan Baku *</h3>
        <Controller
          name="ingredients"
          control={control}
          render={({ field }) => (
            <RecipeIngredientSelector
              ingredients={field.value}
              onChange={field.onChange}
              errors={errors.ingredients?.message}
            />
          )}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
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
