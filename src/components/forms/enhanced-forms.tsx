'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  IngredientSchema, 
  RecipeSchema, 
  CustomerSchema, 
  OrderSchema,
  ProductionSchema,
  FinancialRecordSchema,
  type IngredientFormData,
  type RecipeFormData,
  type CustomerFormData,
  type OrderFormData,
  type ProductionFormData,
  type FinancialRecordFormData
} from '@/lib/validations'

// Form field wrapper component
interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className={error ? 'text-gray-600 dark:text-gray-400' : ''}>
        {label}
        {required && <span className="text-gray-600 dark:text-gray-400 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>}
    </div>
  )
}

// Enhanced Ingredient Form
interface IngredientFormProps {
  initialData?: Partial<IngredientFormData>
  onSubmit: (data: IngredientFormData) => Promise<void>
  isLoading?: boolean
}

export function IngredientForm({ initialData, onSubmit, isLoading }: IngredientFormProps) {
  const { toast } = useToast()
  
  const form = useForm<IngredientFormData>({
    resolver: zodResolver(IngredientSchema) as any,
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
    } catch (error) {
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
        <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              label="Nama Bahan" 
              required 
              error={form.formState.errors.name?.message}
            >
              <Input 
                {...form.register('name')}
                placeholder="Masukkan nama bahan"
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
                  <SelectValue placeholder="Pilih unit" />
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
                placeholder="0"
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
                placeholder="0"
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
                placeholder="0"
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
                placeholder="0"
              />
            </FormField>

            <FormField 
              label="Supplier" 
              error={form.formState.errors.supplier?.message}
            >
              <Input 
                {...form.register('supplier')}
                placeholder="Nama supplier"
              />
            </FormField>

            <FormField 
              label="Kategori" 
              error={form.formState.errors.category?.message}
            >
              <Input 
                {...form.register('category')}
                placeholder="Kategori bahan"
              />
            </FormField>
          </div>

          <FormField 
            label="Deskripsi" 
            error={form.formState.errors.description?.message}
          >
            <Textarea 
              {...form.register('description')}
              placeholder="Deskripsi bahan (opsional)"
              rows={3}
            />
          </FormField>

          <FormField 
            label="Persyaratan Penyimpanan" 
            error={form.formState.errors.storage_requirements?.message}
          >
            <Textarea 
              {...form.register('storage_requirements')}
              placeholder="Persyaratan penyimpanan (opsional)"
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

// Enhanced Recipe Form
interface RecipeFormProps {
  initialData?: Partial<RecipeFormData>
  onSubmit: (data: RecipeFormData) => Promise<void>
  isLoading?: boolean
}

export function RecipeForm({ initialData, onSubmit, isLoading }: RecipeFormProps) {
  const { toast } = useToast()
  
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(RecipeSchema) as any,
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
    fields: form.watch('instructions').map((instruction, index) => ({ id: index.toString(), value: instruction })),
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
    } catch (error) {
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
        <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              label="Nama Resep" 
              required 
              error={form.formState.errors.name?.message}
            >
              <Input 
                {...form.register('name')}
                placeholder="Masukkan nama resep"
              />
            </FormField>

            <FormField 
              label="Kategori" 
              error={form.formState.errors.category?.message}
            >
              <Input 
                {...form.register('category')}
                placeholder="Kategori resep"
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
                placeholder="1"
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
                placeholder="30"
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
                placeholder="0"
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
                  <SelectValue placeholder="Pilih level kesulitan" />
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
                placeholder="0"
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
                placeholder="0"
              />
            </FormField>
          </div>

          <FormField 
            label="Deskripsi" 
            error={form.formState.errors.description?.message}
          >
            <Textarea 
              {...form.register('description')}
              placeholder="Deskripsi resep"
              rows={3}
            />
          </FormField>

          <FormField 
            label="Instruksi" 
            required 
            error={form.formState.errors.instructions?.message}
          >
            <div className="space-y-2">
              {fields.map((field, index) => (
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
}

// Enhanced Customer Form
interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>
  onSubmit: (data: CustomerFormData) => Promise<void>
  isLoading?: boolean
}

export function CustomerForm({ initialData, onSubmit, isLoading }: CustomerFormProps) {
  const { toast } = useToast()
  
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(CustomerSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      customer_type: initialData?.customer_type || 'REGULAR',
      loyalty_points: initialData?.loyalty_points || 0,
      notes: initialData?.notes || '',
      is_active: initialData?.is_active ?? true,
      ...initialData
    }
  })

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      await onSubmit(data)
      toast({
        title: 'Berhasil',
        description: 'Data customer berhasil disimpan'
      })
      if (!initialData) {
        form.reset()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan data customer',
        variant: 'destructive'
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Customer' : 'Tambah Customer'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              label="Nama Customer" 
              required 
              error={form.formState.errors.name?.message}
            >
              <Input 
                {...form.register('name')}
                placeholder="Masukkan nama customer"
              />
            </FormField>

            <FormField 
              label="Email" 
              error={form.formState.errors.email?.message}
            >
              <Input 
                type="email"
                {...form.register('email')}
                placeholder="email@example.com"
              />
            </FormField>

            <FormField 
              label="Nomor Telepon" 
              error={form.formState.errors.phone?.message}
            >
              <Input 
                {...form.register('phone')}
                placeholder="08123456789"
              />
            </FormField>

            <FormField 
              label="Tipe Customer" 
              error={form.formState.errors.customer_type?.message}
            >
              <Select 
                value={form.watch('customer_type')} 
                onValueChange={(value) => form.setValue('customer_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REGULAR">Regular</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="WHOLESALE">Wholesale</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField 
              label="Poin Loyalitas" 
              error={form.formState.errors.loyalty_points?.message}
            >
              <Input 
                type="number"
                min="0"
                {...form.register('loyalty_points', { valueAsNumber: true })}
                placeholder="0"
              />
            </FormField>
          </div>

          <FormField 
            label="Alamat" 
            error={form.formState.errors.address?.message}
          >
            <Textarea 
              {...form.register('address')}
              placeholder="Alamat customer"
              rows={3}
            />
          </FormField>

          <FormField 
            label="Catatan" 
            error={form.formState.errors.notes?.message}
          >
            <Textarea 
              {...form.register('notes')}
              placeholder="Catatan tambahan"
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
            {initialData ? 'Update Customer' : 'Tambah Customer'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Enhanced Financial Record Form
interface FinancialRecordFormProps {
  initialData?: Partial<FinancialRecordFormData>
  onSubmit: (data: FinancialRecordFormData) => Promise<void>
  isLoading?: boolean
}

export function FinancialRecordForm({ initialData, onSubmit, isLoading }: FinancialRecordFormProps) {
  const { toast } = useToast()
  
  const form = useForm<FinancialRecordFormData>({
    resolver: zodResolver(FinancialRecordSchema) as any,
    defaultValues: {
      type: initialData?.type || 'EXPENSE',
      category: initialData?.category || '',
      amount: initialData?.amount || 0,
      description: initialData?.description || '',
      date: initialData?.date || new Date().toISOString(),
      payment_method: initialData?.payment_method || 'CASH',
      is_recurring: initialData?.is_recurring ?? false,
      notes: initialData?.notes || '',
      ...initialData
    }
  })

  const handleSubmit = async (data: FinancialRecordFormData) => {
    try {
      await onSubmit(data)
      toast({
        title: 'Berhasil',
        description: 'Catatan keuangan berhasil disimpan'
      })
      if (!initialData) {
        form.reset()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan catatan keuangan',
        variant: 'destructive'
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Catatan Keuangan' : 'Tambah Catatan Keuangan'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              label="Tipe Transaksi" 
              required 
              error={form.formState.errors.type?.message}
            >
              <Select 
                value={form.watch('type')} 
                onValueChange={(value) => form.setValue('type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe transaksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Pemasukan</SelectItem>
                  <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField 
              label="Kategori" 
              required 
              error={form.formState.errors.category?.message}
            >
              <Input 
                {...form.register('category')}
                placeholder="Kategori transaksi"
              />
            </FormField>

            <FormField 
              label="Jumlah (Rp)" 
              required 
              error={form.formState.errors.amount?.message}
            >
              <Input 
                type="number"
                min="0"
                step="0.01"
                {...form.register('amount', { valueAsNumber: true })}
                placeholder="0"
              />
            </FormField>

            <FormField 
              label="Tanggal" 
              required 
              error={form.formState.errors.date?.message}
            >
              <Input 
                type="datetime-local"
                {...form.register('date')}
              />
            </FormField>

            <FormField 
              label="Metode Pembayaran" 
              error={form.formState.errors.payment_method?.message}
            >
              <Select 
                value={form.watch('payment_method')} 
                onValueChange={(value) => form.setValue('payment_method', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih metode pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                  <SelectItem value="CREDIT_CARD">Kartu Kredit</SelectItem>
                  <SelectItem value="E_WALLET">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField 
              label="Nomor Referensi" 
              error={form.formState.errors.reference_no?.message}
            >
              <Input 
                {...form.register('reference_no')}
                placeholder="Nomor transaksi/struk"
              />
            </FormField>
          </div>

          <FormField 
            label="Deskripsi" 
            required 
            error={form.formState.errors.description?.message}
          >
            <Textarea 
              {...form.register('description')}
              placeholder="Deskripsi transaksi"
              rows={3}
            />
          </FormField>

          <FormField 
            label="Catatan" 
            error={form.formState.errors.notes?.message}
          >
            <Textarea 
              {...form.register('notes')}
              placeholder="Catatan tambahan"
              rows={2}
            />
          </FormField>

          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={form.watch('is_recurring')}
              onCheckedChange={(checked) => form.setValue('is_recurring', !!checked)}
            />
            <Label>Transaksi Berulang</Label>
          </div>

          {form.watch('is_recurring') && (
            <FormField 
              label="Periode Berulang" 
              error={form.formState.errors.recurring_period?.message}
            >
              <Select 
                value={form.watch('recurring_period')} 
                onValueChange={(value) => form.setValue('recurring_period', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode berulang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Harian</SelectItem>
                  <SelectItem value="WEEKLY">Mingguan</SelectItem>
                  <SelectItem value="MONTHLY">Bulanan</SelectItem>
                  <SelectItem value="YEARLY">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          )}

          <Button 
            type="submit" 
            disabled={isLoading || !form.formState.isValid}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Update Catatan' : 'Tambah Catatan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Enhanced Forms bundle for lazy loading
export const EnhancedForms = {
  IngredientForm,
  RecipeForm,
  CustomerForm,
  FinancialRecordForm
}

// Default export for lazy loading
export default EnhancedForms
