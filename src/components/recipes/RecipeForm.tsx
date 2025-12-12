'use client'

import { RecipeIngredientSelector } from '@/components/recipes/RecipeIngredientSelector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { recipeSchema, type RecipeFormData, type RecipeFormInput } from '@/lib/validations/recipes'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

type RecipeIngredient = {
  ingredient_id: string
  quantity: number
  unit?: string
  notes?: string | null
}

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
  const mergedDefaultValues: Partial<RecipeFormInput> = {
    ...defaultValues,
    servings: defaultValues?.servings ?? 1,
    yield_unit: defaultValues?.yield_unit ?? 'porsi',
    ingredients: defaultValues?.ingredients ?? [],
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RecipeFormInput>({
    resolver: zodResolver(recipeSchema),
    defaultValues: mergedDefaultValues,
  })

  return (
    <form
      onSubmit={handleSubmit((values) => {
        onSubmit(recipeSchema.parse(values))
      })}
      className="space-y-6"
    >
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
             <Label htmlFor="servings">Jumlah Hasil</Label>
             <Input
               id="servings"
               type="number"
               {...register('servings', { valueAsNumber: true })}
               placeholder="1"
               aria-describedby={errors.servings ? 'servings-error' : undefined}
             />
             {errors.servings && (
               <p id="servings-error" className="text-sm text-destructive">{errors.servings.message}</p>
             )}
           </div>
        </div>

        <div className="space-y-2">
          <Label>Unit Hasil</Label>
          <Controller
            name="yield_unit"
            control={control}
            defaultValue={defaultValues?.yield_unit ?? 'porsi'}
            render={({ field }) => (
              <Select value={field.value ?? 'porsi'} onValueChange={field.onChange}>
                <SelectTrigger aria-describedby={errors.yield_unit ? 'yield-unit-error' : undefined}>
                  <SelectValue placeholder="Pilih unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="porsi">porsi</SelectItem>
                  <SelectItem value="pcs">pcs</SelectItem>
                  <SelectItem value="cup">cup</SelectItem>
                  <SelectItem value="botol">botol</SelectItem>
                  <SelectItem value="pack">pack</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.yield_unit && (
            <p id="yield-unit-error" className="text-sm text-destructive">{errors.yield_unit.message}</p>
          )}
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
             <Label htmlFor="prep_time">Waktu Persiapan (menit)</Label>
             <Input
               id="prep_time"
               type="number"
               {...register('prep_time', { valueAsNumber: true })}
               placeholder="0"
             />
             {errors.prep_time && (
               <p className="text-sm text-destructive">{errors.prep_time.message}</p>
             )}
           </div>

           <div className="space-y-2">
             <Label htmlFor="cook_time">Waktu Memasak (menit)</Label>
             <Input
               id="cook_time"
               type="number"
               {...register('cook_time', { valueAsNumber: true })}
               placeholder="0"
             />
             {errors.cook_time && (
               <p className="text-sm text-destructive">{errors.cook_time.message}</p>
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
              ingredients={field.value as RecipeIngredient[]}
              onChange={field.onChange}
              errors={errors.ingredients?.message || ''}
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
