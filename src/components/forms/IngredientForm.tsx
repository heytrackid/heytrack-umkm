'use client'
import * as React from 'react'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  IngredientSchema,
  type IngredientFormData
} from '@/lib/validations'
import { FormField } from './shared/FormField'

interface IngredientFormProps {
  initialData?: Partial<IngredientFormData>
  onSubmit: (data: IngredientFormData) => Promise<void>
  isLoading?: boolean
}

export function IngredientForm({ initialData, onSubmit, isLoading }: IngredientFormProps) {
  const { toast } = useToast()
  
  const form = useForm<IngredientFormData>({
    resolver: zodResolver(IngredientSchema),
    mode: 'onChange',
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      unit: initialData?.unit || 'kg',
      price_per_unit: initialData?.price_per_unit || 0,
      current_stock: initialData?.current_stock || 0,
      min_stock: initialData?.min_stock || 0,
      max_stock: initialData?.max_stock || undefined,
      supplier: initialData?.supplier || '',
      category: initialData?.category || '',
      is_active: initialData?.is_active ?? true,
      ...initialData
    }
  })

  const handleSubmit = async (data: IngredientFormData) => {
    try {
      await onSubmit(data)
      toast({
        title: 'Berhasil',
        description: 'Data bahan berhasil disimpan'
      })
      if (!initialData) {
        form.reset()
      }
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan data bahan',
        variant: 'destructive'
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Bahan' : 'Tambah Bahan'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              label="Nama Bahan" 
              required 
              error={form.formState.errors.name?.message}
            >
              <Input 
                {...form.register('name')}

              />
            </FormField>

            <FormField 
              label="Unit" 
              required 
              error={form.formState.errors.unit?.message}
            >
              <Select 
                value={form.watch('unit')} 
                onValueChange={(value) => form.setValue('unit', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilogram</SelectItem>
                  <SelectItem value="gram">Gram</SelectItem>
                  <SelectItem value="liter">Liter</SelectItem>
                  <SelectItem value="ml">Mililiter</SelectItem>
                  <SelectItem value="pcs">Pieces</SelectItem>
                  <SelectItem value="pack">Pack</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField 
              label="Harga per Unit (Rp)" 
              required 
              error={form.formState.errors.price_per_unit?.message}
            >
              <Input 
                type="number"
                min="0"
                step="0.01"
                {...form.register('price_per_unit', { valueAsNumber: true })}

              />
            </FormField>

            <FormField 
              label="Stok Saat Ini" 
              required 
              error={form.formState.errors.current_stock?.message}
            >
              <Input 
                type="number"
                min="0"
                step="0.01"
                {...form.register('current_stock', { valueAsNumber: true })}

              />
            </FormField>

            <FormField 
              label="Stok Minimum" 
              required 
              error={form.formState.errors.min_stock?.message}
            >
              <Input 
                type="number"
                min="0"
                step="0.01"
                {...form.register('min_stock', { valueAsNumber: true })}

              />
            </FormField>

            <FormField 
              label="Stok Maksimum" 
              error={form.formState.errors.max_stock?.message}
            >
              <Input 
                type="number"
                min="0"
                step="0.01"
                {...form.register('max_stock', { valueAsNumber: true })}

              />
            </FormField>

            <FormField 
              label="Supplier" 
              error={form.formState.errors.supplier?.message}
            >
              <Input 
                {...form.register('supplier')}

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
            label="Persyaratan Penyimpanan" 
            error={form.formState.errors.storage_requirements?.message}
          >
            <Textarea 
              {...form.register('storage_requirements')}

              rows={2}
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
            {initialData ? 'Update Bahan' : 'Tambah Bahan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
