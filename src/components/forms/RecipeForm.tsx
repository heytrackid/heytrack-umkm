'use client'

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  RecipeFormSchema,
  type RecipeForm as RecipeFormData
} from '@/lib/validations/domains/recipe'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { FormField } from './shared/FormField'
import type { Database } from '@/types/supabase-generated'
import { getErrorMessage } from '@/lib/type-guards'

type Recipe = Database['public']['Tables']['recipes']['Row']

interface RecipeFormProps {
  initialData?: Partial<RecipeFormData> & Partial<Recipe>
  onSubmit: (data: RecipeFormData) => Promise<void>
  isLoading?: boolean
}

export const RecipeForm = memo(({ initialData, onSubmit, isLoading }: RecipeFormProps) => {
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(RecipeFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      servings: initialData?.servings || 1,
      preparation_time: initialData?.preparation_time || initialData?.prep_time || 30,
      cooking_time: initialData?.cooking_time || initialData?.cook_time || 0,
      instructions: typeof initialData?.instructions === 'string' ? [] : initialData?.instructions || [],
      difficulty: (initialData?.difficulty as 'EASY' | 'MEDIUM' | 'HARD') || 'MEDIUM',
      category: initialData?.category || '',
      is_active: initialData?.is_active ?? true,
      is_available: initialData?.is_available ?? true,
      selling_price: initialData?.selling_price || 0,
      ingredients: []
    }
  })

  const handleSubmit = async (data: RecipeFormData) => {
    try {
      await onSubmit(data)
      toast({
        title: 'Berhasil',
        description: 'Resep berhasil disimpan'
      })
      if (!initialData) {
        form.reset()
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      toast({
        title: 'Error',
        description: message || 'Gagal menyimpan resep',
        variant: 'destructive'
      })
    }
  }

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
              label="Kategori"
              error={form.formState.errors.category?.message}
            >
              <Input
                {...form.register('category')}
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
              error={form.formState.errors.preparation_time?.message}
            >
              <Input
                type="number"
                min="1"
                max="1440"
                {...form.register('preparation_time', { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              label="Waktu Memasak (menit)"
              error={form.formState.errors.cooking_time?.message}
            >
              <Input
                type="number"
                min="0"
                {...form.register('cooking_time', { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              label="Level Kesulitan"
              error={form.formState.errors.difficulty?.message}
            >
              <Select
                value={form.watch('difficulty')}
                onValueChange={(value) => {
                  form.setValue('difficulty', value as 'EASY' | 'MEDIUM' | 'HARD')
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Mudah</SelectItem>
                  <SelectItem value="MEDIUM">Sedang</SelectItem>
                  <SelectItem value="HARD">Sulit</SelectItem>
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
              checked={form.watch('is_active')}
              onCheckedChange={(checked) => form.setValue('is_active', !!checked)}
            />
            <Label>Aktif</Label>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !form.formState.isValid}
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
