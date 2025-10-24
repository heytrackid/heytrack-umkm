'use client'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
    RecipeSchema,
    type RecipeFormData
} from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { memo } from 'react'
import { useForm } from 'react-hook-form'
import { FormField } from './shared/FormField'

interface RecipeFormProps {
  initialData?: Partial<RecipeFormData>
  onSubmit: (data: RecipeFormData) => Promise<void>
  isLoading?: boolean
}

export const RecipeForm = memo(function RecipeForm({ initialData, onSubmit, isLoading }: RecipeFormProps) {
  const { toast } = useToast()
  
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(RecipeSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      servings: initialData?.servings || 1,
      prep_time_minutes: initialData?.prep_time_minutes || 30,
      cook_time_minutes: initialData?.cook_time_minutes || 0,
      instructions: initialData?.instructions || [''],
      difficulty_level: initialData?.difficulty_level || 'EASY',
      category: initialData?.category || '',
      is_active: initialData?.is_active ?? true,
      ...initialData
    }
  })

  const { fields, append, remove } = form.watch('instructions') ? {
    fields: form.watch('instructions').map((instruction, index: number) => ({ id: index.toString(), value: instruction })),
    append: (value: string) => {
      const current = form.getValues('instructions')
      form.setValue('instructions', [...current, value])
    },
    remove: (index: number) => {
      const current = form.getValues('instructions')
      form.setValue('instructions', current.filter((_, i) => i !== index))
    }
  } : { fields: [], append: () => {}, remove: () => {} }

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
      toast({
        title: 'Error',
        description: 'Gagal menyimpan resep',
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
        <form onSubmit={form.handleSubmit} className="space-y-4">
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
              error={form.formState.errors.prep_time_minutes?.message}
            >
              <Input 
                type="number"
                min="1"
                max="1440"
                {...form.register('prep_time_minutes', { valueAsNumber: true })}

              />
            </FormField>

            <FormField 
              label="Waktu Memasak (menit)" 
              error={form.formState.errors.cook_time_minutes?.message}
            >
              <Input 
                type="number"
                min="0"
                {...form.register('cook_time_minutes', { valueAsNumber: true })}

              />
            </FormField>

            <FormField 
              label="Level Kesulitan" 
              error={form.formState.errors.difficulty_level?.message}
            >
              <Select 
                value={form.watch('difficulty_level')} 
                onValueChange={(value) => form.setValue('difficulty_level', value as any)}
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

            <FormField 
              label="Margin Profit (%)" 
              error={form.formState.errors.profit_margin?.message}
            >
              <Input 
                type="number"
                min="0"
                max="100"
                step="0.1"
                {...form.register('profit_margin', { valueAsNumber: true })}

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
            required 
            error={form.formState.errors.instructions?.message}
          >
            <div className="space-y-2">
              {fields.map((field, index: number) => (
                <div key={field.id} className="flex gap-2">
                  <div className="flex-1">
                    <Input 
                      value={field.value}
                      onChange={(e) => {
                        const current = form.getValues('instructions')
                        const updated = [...current]
                        updated[index] = e.target.value
                        form.setValue('instructions', updated)
                      }}
                      placeholder={`Instruksi ${index + 1}`}
                    />
                  </div>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append('')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Instruksi
              </Button>
            </div>
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
