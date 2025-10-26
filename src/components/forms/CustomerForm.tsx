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
  CustomerFormSchema,
  type CustomerForm
} from '@/lib/validations/domains/customer'
import { FormField } from './shared/FormField'
import { useFormWithValidation, createFormSubmitHandler, CUSTOMER_TYPES } from '@/lib/shared'

interface CustomerFormProps {
  initialData?: Partial<CustomerForm>
  onSubmit: (data: CustomerForm) => Promise<void>
  isLoading?: boolean
}

export function CustomerForm({ initialData, onSubmit, isLoading }: CustomerFormProps) {
  const form = useFormWithValidation(CustomerFormSchema, {
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

  const handleSubmit = createFormSubmitHandler(
    form,
    onSubmit,
    'Data customer berhasil disimpan',
    'Gagal menyimpan data customer',
    !initialData,
    'Berhasil',
    'Error'
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Customer' : 'Tambah Customer'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              label="Nama Customer" 
              required 
              error={form.formState.errors.name?.message}
            >
              <Input 
                {...form.register('name')}

              />
            </FormField>

            <FormField 
              label="Email" 
              error={form.formState.errors.email?.message}
            >
              <Input 
                type="email"
                {...form.register('email')}

              />
            </FormField>

            <FormField 
              label="Nomor Telepon" 
              error={form.formState.errors.phone?.message}
            >
              <Input 
                {...form.register('phone')}

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
                  <SelectValue />
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

              />
            </FormField>
          </div>

          <FormField 
            label="Alamat" 
            error={form.formState.errors.address?.message}
          >
            <Textarea 
              {...form.register('address')}

              rows={3}
            />
          </FormField>

          <FormField 
            label="Catatan" 
            error={form.formState.errors.notes?.message}
          >
            <Textarea 
              {...form.register('notes')}

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
