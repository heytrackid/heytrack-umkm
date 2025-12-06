'use client'

import { AlertCircle } from '@/components/icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { safeNumber } from '@/lib/type-guards'
import { cn } from '@/lib/utils'

import type { PaymentMethod } from '@/app/orders/types/orders-db.types'
import type { OrderFormTabProps } from './types'

interface PaymentTabProps extends OrderFormTabProps {
  subtotal: number
  taxAmount: number
  totalAmount: number
  formatCurrency: (amount: number) => string
}

export function PaymentTab({
  formData,
  onInputChange,
  fieldErrors,
  setFieldErrors,
  subtotal,
  taxAmount,
  totalAmount,
  formatCurrency
}: PaymentTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Label htmlFor="paymentMethod" className="text-sm font-medium">Metode Pembayaran</Label>
          <select
            className="w-full p-2 border border-input rounded-md bg-background mt-1"
            value={formData.payment_method}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onInputChange('payment_method', e.target.value as PaymentMethod)}
          >
            <option value="CASH">Tunai</option>
            <option value="BANK_TRANSFER">Transfer Bank</option>
            <option value="CREDIT_CARD">Kartu Debit/Kredit</option>
            <option value="DIGITAL_WALLET">E-Wallet (GoPay, OVO, dll)</option>
            <option value="OTHER">Lainnya</option>
          </select>
        </div>
        <div>
          <Label htmlFor="discount" className="text-sm font-medium">Diskon (Rp)</Label>
          <Input
            id="discount"
            type="number"
            placeholder="0"
            value={formData.discount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('discount', safeNumber(e.target.value, 0))}
            min="0"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="tax" className="text-sm font-medium">Pajak (%)</Label>
          <Input
            id="tax"
            type="number"
            placeholder="0"
            value={formData.tax_amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('tax_amount', safeNumber(e.target.value, 0))}
            min="0"
            max="100"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="paidAmount" className="text-sm font-medium">Jumlah Dibayar (Rp)</Label>
          <Input
            id="paidAmount"
            type="number"
            placeholder="0"
            value={formData.paid_amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onInputChange('paid_amount', safeNumber(e.target.value, 0))
              if (fieldErrors['paid_amount']) {
                setFieldErrors(prev => {
                  const newErrors = { ...prev }
                  delete newErrors['paid_amount']
                  return newErrors
                })
              }
            }}
            min="0"
            step="1000"
            className={cn(
              "mt-1",
              fieldErrors['paid_amount'] && "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={Boolean(fieldErrors['paid_amount'])}
          />
          {fieldErrors['paid_amount'] && (
            <div className="flex items-center gap-2 text-sm text-destructive mt-1">
              <AlertCircle className="h-4 w-4" />
              {fieldErrors['paid_amount']}
            </div>
          )}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-medium mb-2">Ringkasan Pembayaran</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Diskon:</span>
            <span>- {formatCurrency(formData.discount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pajak ({formData.tax_amount}%):</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Ongkir:</span>
            <span>{formatCurrency(formData.delivery_fee)}</span>
          </div>
          <hr />
          <div className="flex justify-between font-medium text-base">
            <span>Total Tagihan:</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Dibayar:</span>
            <span>{formatCurrency(formData.paid_amount)}</span>
          </div>
          {totalAmount > formData.paid_amount && (
            <div className="flex justify-between text-foreground font-medium">
              <span>Sisa Belum Dibayar:</span>
              <span>{formatCurrency(totalAmount - formData.paid_amount)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
