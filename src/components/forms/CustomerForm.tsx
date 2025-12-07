'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from '@/components/icons'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { handleError } from '@/lib/error-handling'
import { successToast } from '@/hooks/use-toast'

import type { Row } from '@/types/database'

import { FormField } from '@/components/forms/shared/FormField'




type Customer = Row<'customers'>

// Form schema without user_id (will be added on submit)
const CustomerFormSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid').nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  customer_type: z.enum(['retail', 'wholesale', 'vip', 'regular']).nullable().optional(),
  discount_percentage: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  user_id: z.string().uuid(),
})

type CustomerFormData = z.infer<typeof CustomerFormSchema>

interface CustomerFormComponentProps {
  initialData?: Partial<Customer>
  onSubmit: (data: CustomerFormData) => Promise<void>
  isLoading?: boolean
}

export const CustomerForm = ({ initialData, onSubmit, isLoading }: CustomerFormComponentProps): JSX.Element => {


  const form = useForm<CustomerFormData>({
    resolver: zodResolver(CustomerFormSchema),
    mode: 'onBlur',
    defaultValues: {
      name: initialData?.name ?? '',
      email: initialData?.email ?? null,
      phone: initialData?.phone ?? null,
      address: initialData?.address ?? null,
      customer_type: (initialData?.customer_type as 'regular' | 'retail' | 'vip' | 'wholesale') || 'regular',
      notes: initialData?.notes ?? null,
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
      user_id: initialData?.user_id ?? '',
    }
  })

  // Extract watch values to avoid React Hook Form linting warnings
  const watchedCustomerType = useWatch({ control: form.control, name: 'customer_type' })
  const watchedIsActive = useWatch({ control: form.control, name: 'is_active' })

  const handleSubmit = async (data: CustomerFormData): Promise<void> => {
    try {
      await onSubmit(data)
      successToast('Berhasil', 'Data customer berhasil disimpan')
      if (!initialData) {
        form.reset()
      }
    } catch (error: unknown) {
      handleError(error as Error, 'Customer Form: submit', true, 'Gagal menyimpan data customer')
    }
  }

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
              error={form.formState.errors['name']?.message as string}
            >
              <Input {...form.register('name')} />
            </FormField>

            <FormField
              label="Email (Opsional)"
              error={form.formState.errors['email']?.message as string}
            >
              <Input type="email" {...form.register('email')} placeholder="Masukkan email jika ada" />
            </FormField>

            <FormField
              label="Nomor Telepon"
              error={form.formState.errors['phone']?.message as string}
            >
              <Input {...form.register('phone')} />
            </FormField>

            <FormField
              label="Tipe Customer"
              error={form.formState.errors['customer_type']?.message as string}
            >
              <Select
                value={watchedCustomerType as string}
                onValueChange={(value) => form.setValue('customer_type', value as 'regular' | 'retail' | 'vip' | 'wholesale')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField
            label="Alamat"
            error={form.formState.errors['address']?.message as string}
          >
            <Textarea {...form.register('address')} rows={3} />
          </FormField>

          <FormField
            label="Catatan"
            error={form.formState.errors['notes']?.message as string}
          >
            <Textarea {...form.register('notes')} rows={2} />
          </FormField>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={watchedIsActive ?? true}
              onCheckedChange={(checked) => form.setValue('is_active', checked === true)}
            />
            <Label>Aktif</Label>
          </div>

          <Button
            type="submit"
            disabled={isLoading ?? !form.formState.isValid}
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
