'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  FinancialRecordSchema,
  type FinancialRecordFormData
} from '@/lib/validations'

import type { Row } from '@/types/database'

import { FormField } from '@/components/forms/shared/FormField'


type FinancialRecord = Row<'financial_records'>

interface FinancialRecordFormProps {
  initialData?: Partial<FinancialRecord> & Partial<FinancialRecordFormData>
  onSubmit: (data: FinancialRecordFormData) => Promise<void>
  isLoading?: boolean
}

export const FinancialRecordForm = ({ initialData, onSubmit, isLoading }: FinancialRecordFormProps) => {


  const form = useForm<FinancialRecordFormData>({
    resolver: zodResolver(FinancialRecordSchema),
    defaultValues: {
      type: initialData?.type ?? 'EXPENSE',
      category: initialData?.category ?? '',
      amount: initialData?.amount ?? 0,
      description: initialData?.description ?? '',
      date: initialData?.date ?? new Date().toISOString(),
      payment_method: initialData?.payment_method ?? 'CASH',
      is_recurring: initialData?.is_recurring ?? false,
      notes: initialData?.notes ?? '',
      ...initialData
    }
  })

  const handleSubmit = async (data: FinancialRecordFormData) => {
    try {
      await onSubmit(data)
      toast.success('Catatan keuangan berhasil disimpan')
      if (!initialData) {
        form.reset()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan catatan keuangan')
    }
  }

  // Extract watch values to avoid React Hook Form linting warnings
  const watchedType = useWatch({ control: form.control, name: 'type' })
  const watchedPaymentMethod = useWatch({ control: form.control, name: 'payment_method' })
  const watchedIsRecurring = useWatch({ control: form.control, name: 'is_recurring' })
  const watchedRecurringPeriod = useWatch({ control: form.control, name: 'recurring_period' })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Catatan Keuangan' : 'Tambah Catatan Keuangan'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Tipe Transaksi"
              required
              {...(form.formState.errors['type']?.message ? { error: form.formState.errors['type'].message } : {})}
            >
              <Select
                value={watchedType}
                onValueChange={(value) => {
                  if (value === 'INCOME' || value === 'EXPENSE') {
                    form.setValue('type', value)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
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
                {...(watchedPaymentMethod ? { value: watchedPaymentMethod as string } : {})}
                onValueChange={(value) => {
                  if (
                    value === 'CASH' ||
                    value === 'TRANSFER' ||
                    value === 'CREDIT_CARD' ||
                    value === 'E_WALLET'
                  ) {
                    form.setValue('payment_method', value)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
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
              checked={watchedIsRecurring ?? false}
              onCheckedChange={(checked) => form.setValue('is_recurring', Boolean(checked))}
            />
            <Label>Transaksi Berulang</Label>
          </div>

          {watchedIsRecurring && (
            <FormField
              label="Periode Berulang"
              error={form.formState.errors.recurring_period?.message}
            >
              <Select
                {...(watchedRecurringPeriod ? { value: watchedRecurringPeriod as string } : {})}
                onValueChange={(value) => {
                  if (
                    value === 'DAILY' ||
                    value === 'WEEKLY' ||
                    value === 'MONTHLY' ||
                    value === 'YEARLY'
                  ) {
                    form.setValue('recurring_period', value)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
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
            disabled={isLoading ?? !form.formState.isValid}
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
