'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OperationalCostFormSchema, type OperationalCostForm } from '@/lib/validations/form-validations'
import { Save, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

interface CostFormProps {
  cost?: OperationalCostForm
  onSave: (data: OperationalCostForm) => void
  onCancel: () => void
  isMobile?: boolean
}

const costCategories = [
  { id: 'rent', label: 'Sewa Tempat', icon: '🏢' },
  { id: 'utilities', label: 'Listrik & Air', icon: '💡' },
  { id: 'salaries', label: 'Gaji Karyawan', icon: '👥' },
  { id: 'equipment', label: 'Peralatan', icon: '🔧' },
  { id: 'marketing', label: 'Marketing', icon: '📢' },
  { id: 'packaging', label: 'Packaging', icon: '📦' },
  { id: 'transportation', label: 'Transportasi', icon: '🚗' },
  { id: 'maintenance', label: 'Pemeliharaan', icon: '🛠️' },
  { id: 'other', label: 'Lainnya', icon: '📋' }
]

/**
 * Cost Form Component
 * Extracted from operational-costs/page.tsx for code splitting
 */
export default function CostForm({
  cost,
  onSave,
  onCancel
}: CostFormProps) {
  const form = useForm({
    resolver: zodResolver(OperationalCostFormSchema),
    defaultValues: cost || {
      name: '',
      category: '',
      description: '',
      amount: 0,
      frequency: 'MONTHLY' as const,
      is_active: true
    }
  })

  const handleSubmit = (data: OperationalCostForm) => {
    onSave(data)
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* Category */}
        <div className="space-y-2">
          <Label>Kategori *</Label>
          <Select
            value={form.watch('category')}
            onValueChange={(value) => form.setValue('category', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {costCategories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category && (
            <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Deskripsi *</Label>
          <Input
            {...form.register('description')}
            placeholder="Deskripsikan biaya ini"
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label>Jumlah *</Label>
          <Input
            type="number"
            {...form.register('amount', { valueAsNumber: true })}
            placeholder="0"
            min={0}
            step={0.01}
          />
          {form.formState.errors.amount && (
            <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label>Nama Biaya *</Label>
          <Input
            {...form.register('name')}
            placeholder="Nama biaya operasional"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>

        {/* Frequency */}
        <div className="space-y-2">
          <Label>Frekuensi</Label>
          <Select
            value={form.watch('frequency')}
            onValueChange={(value) => form.setValue('frequency', value as 'MONTHLY' | 'YEARLY' | 'QUARTERLY' | 'ONE_TIME')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ONE_TIME">Sekali</SelectItem>
              <SelectItem value="MONTHLY">Bulanan</SelectItem>
              <SelectItem value="QUARTERLY">Kuartalan</SelectItem>
              <SelectItem value="YEARLY">Tahunan</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.frequency && (
            <p className="text-sm text-red-600">{form.formState.errors.frequency.message}</p>
          )}
        </div>

        {/* Is Recurring */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...form.register('is_active')}
              className="rounded"
            />
            <Label>Aktif</Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={form.handleSubmit(handleSubmit)}
            className="flex-1"
            disabled={form.formState.isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {cost ? "Update" : "Simpan"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Batal
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
