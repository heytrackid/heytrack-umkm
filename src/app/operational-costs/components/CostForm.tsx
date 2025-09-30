'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon, Save, X } from 'lucide-react'
import { useI18n } from '@/providers/I18nProvider'
import { cn } from '@/lib/utils'

interface CostFormProps {
  cost?: any
  onSave: (cost: any) => void
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
  onCancel,
  isMobile = false 
}: CostFormProps) {
  const { t } = useI18n()
  const [formData, setFormData] = React.useState(cost || {
    category: '',
    description: '',
    amount: 0,
    date: new Date(),
    payment_method: 'cash',
    notes: ''
  })

  const handleSubmit = () => {
    if (!formData.category || !formData.amount) {
      alert(t('validation.fillRequiredFields'))
      return
    }
    onSave(formData)
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* Category */}
        <div className="space-y-2">
          <Label>{t('forms.labels.category')} *</Label>
          <Select 
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('forms.placeholders.selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {costCategories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>{t('forms.labels.description')} *</Label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder={t('forms.placeholders.description')}
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label>{t('forms.labels.amount')} *</Label>
          <Input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
            placeholder="0"
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label>{t('forms.labels.date')}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? format(new Date(formData.date), "PPP") : <span>{t('forms.placeholders.pickDate')}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.date ? new Date(formData.date) : undefined}
                onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <Label>{t('forms.labels.paymentMethod')}</Label>
          <Select
            value={formData.payment_method}
            onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">{t('forms.paymentMethods.cash')}</SelectItem>
              <SelectItem value="transfer">{t('forms.paymentMethods.transfer')}</SelectItem>
              <SelectItem value="credit_card">{t('forms.paymentMethods.creditCard')}</SelectItem>
              <SelectItem value="digital_wallet">{t('forms.paymentMethods.digitalWallet')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>{t('forms.labels.notes')}</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder={t('forms.placeholders.notes')}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSubmit} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {cost ? t('common.actions.update') : t('common.actions.save')}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            {t('common.actions.cancel')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
