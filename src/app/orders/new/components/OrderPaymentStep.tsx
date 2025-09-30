'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OrderFormData } from '../hooks/useOrderLogic'

interface OrderPaymentStepProps {
  formData: OrderFormData
  onInputChange: (field: keyof OrderFormData, value: any) => void
}

export default function OrderPaymentStep({
  formData,
  onInputChange
}: OrderPaymentStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pembayaran</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="payment_method">Metode Pembayaran</Label>
          <Select 
            value={formData.payment_method} 
            onValueChange={(value) => onInputChange('payment_method', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Tunai</SelectItem>
              <SelectItem value="transfer">Transfer Bank</SelectItem>
              <SelectItem value="credit_card">Kartu Kredit</SelectItem>
              <SelectItem value="digital_wallet">E-Wallet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="discount_amount">Diskon</Label>
          <Input
            id="discount_amount"
            type="number"
            min="0"
            value={formData.discount_amount}
            onChange={(e) => onInputChange('discount_amount', parseFloat || 0)}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="tax_rate">Pajak (%)</Label>
          <Input
            id="tax_rate"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.tax_rate}
            onChange={(e) => onInputChange('tax_rate', parseFloat || 0)}
          />
        </div>
      </div>
    </div>
  )
}
