'use client'

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
import { z } from 'zod'
import { FormField } from './shared/FormField'
import type { CustomersTable } from '@/types/database'
import { getErrorMessage } from '@/lib/type-guards'



type Customer = CustomersTable

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

export const CustomerForm = ({ initialData, onSubmit, isLoading }: CustomerFormComponentProps) => {
  const { toast } = useToast()

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(CustomerFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: initialData?.name ?? '',
      email: initialData?.email ?? null,
      phone: initialData?.phone ?? null,
      address: initialData?.address ?? null,
      customer_type: (initialData?.customer_type as 'retail' | 'wholesale' | 'vip' | 'regular') || 'regular',
      notes: initialData?.notes ?? null,
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
      user_id: initialData?.user_id ?? '',
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
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      toast({
        title: 'Error',
        description: message || 'Gagal menyimpan data customer',
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
              label="Email"
              error={form.formState.errors['email']?.message as string}
            >
              <Input type="email" {...form.register('email')} />
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
                value={form.watch('customer_type') as string}
                onValueChange={(value) => form.setValue('customer_type', value as 'retail' | 'wholesale' | 'vip' | 'regular')}
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
              checked={form.watch('is_active') ?? true}
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
