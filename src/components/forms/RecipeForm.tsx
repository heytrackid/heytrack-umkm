'use client'

import { Loader2 } from '@/components/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { memo } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { handleError } from '@/lib/error-handling'
import {
  RecipeFormSchema,
  type RecipeForm as RecipeFormData
} from '@/lib/validations/domains/recipe'
import { toast } from 'sonner'

import type { Row } from '@/types/database'

import { FormField } from '@/components/forms/shared/FormField'


type Recipe = Row<'recipes'>

interface RecipeFormProps {
  initialData?: Partial<Recipe> & Partial<RecipeFormData>
  onSubmit: (data: RecipeFormData) => Promise<void>
  isLoading?: boolean
}

export const RecipeForm = memo(({ initialData, onSubmit, isLoading }: RecipeFormProps) => {


  const form = useForm({
    resolver: zodResolver(RecipeFormSchema),
    mode: 'onBlur',
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      servings: initialData?.servings ?? 1,
      prep_time: initialData?.prep_time ?? 30,
      cook_time: initialData?.cook_time ?? 0,
      instructions: typeof initialData?.instructions === 'string' ? [] : initialData?.instructions ?? [],
      difficulty: (initialData?.difficulty as 'easy' | 'hard' | 'medium') || 'medium',

      is_active: initialData?.is_active ?? true,
      selling_price: initialData?.selling_price ?? 0,
      ingredients: []
    }
  })

  const handleSubmit = async (data: RecipeFormData) => {
    try {
      await onSubmit(data)
      toast.success('Resep berhasil disimpan')
      if (!initialData) {
        form.reset()
      }
    } catch (error: unknown) {
      handleError(error as Error, 'Recipe Form: submit', true, 'Gagal menyimpan resep')
    }
  }

  // Extract watch values to avoid React Hook Form linting warnings
  const watchedDifficulty = useWatch({ control: form.control, name: 'difficulty' })
  const watchedIsActive = useWatch({ control: form.control, name: 'is_active' })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Resep' : 'Tambah Resep'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Nama Resep"
              required
              error={form.formState.errors.name?.message}
            >
              <Input
                {...form.register('name')}
              />
            </FormField>



            <FormField
              label="Jumlah Porsi"
              required
              error={form.formState.errors.servings?.message}
            >
              <Input
                type="number"
                min="1"
                max="1000"
                {...form.register('servings', { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              label="Waktu Persiapan (menit)"
              required
              error={form.formState.errors.prep_time?.message}
            >
              <Input
                {...form.register('prep_time', { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="30"
              />
            </FormField>

            <FormField
              label="Waktu Memasak (menit)"
              error={form.formState.errors.cook_time?.message}
            >
              <Input
                {...form.register('cook_time', { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="0"
              />
            </FormField>

            <FormField
              label="Level Kesulitan"
              error={form.formState.errors.difficulty?.message}
            >
              <Select
                onValueChange={(value) => {
                  form.setValue('difficulty', value as 'easy' | 'hard' | 'medium')
                }}
                {...(watchedDifficulty ? { value: watchedDifficulty as string } : {})}
              
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Mudah</SelectItem>
                  <SelectItem value="medium">Sedang</SelectItem>
                  <SelectItem value="hard">Sulit</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Harga Jual (Rp)"
              error={form.formState.errors.selling_price?.message}
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                {...form.register('selling_price', { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <FormField
            label="Deskripsi"
            error={form.formState.errors.description?.message}
          >
            <Textarea
              {...form.register('description')}
              rows={3}
            />
          </FormField>

          <FormField
            label="Instruksi"
            error={form.formState.errors.instructions?.message}
          >
            <Textarea
              {...form.register('instructions')}
              rows={5}
              placeholder="Tulis instruksi pembuatan resep..."
            />
          </FormField>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={Boolean(watchedIsActive)}
              onCheckedChange={(checked) => form.setValue('is_active', Boolean(checked))}
            />
            <Label>Aktif</Label>
          </div>

          <Button
            type="submit"
            disabled={isLoading ?? !form.formState.isValid}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Update Resep' : 'Tambah Resep'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
})

RecipeForm.displayName = 'RecipeForm'
