'use client'

import { AlertCircle } from 'lucide-react'

import type { PaymentMethod } from '@/app/orders/types/orders-db.types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCurrency } from '@/hooks/useCurrency'
import { safeNumber } from '@/lib/type-guards'




/**
 * Payment Section Component
 * Handles payment information and summary
 */

interface PaymentFormData {
    payment_method: PaymentMethod
    discount: number
    tax_amount: number
    paid_amount: number
}

type PaymentField = keyof PaymentFormData

interface PaymentSectionProps {
    formData: PaymentFormData
    fieldErrors: Record<string, string>
    subtotal: number
    taxAmount: number
    totalAmount: number
    deliveryFee: number
    onInputChange: <K extends PaymentField>(field: K, value: PaymentFormData[K]) => void
    onClearError: (field: PaymentField) => void
}

export const PaymentSection = ({
    formData,
    fieldErrors,
    subtotal,
    taxAmount,
    totalAmount,
    deliveryFee,
    onInputChange,
    onClearError
}: PaymentSectionProps) => {
    const { formatCurrency } = useCurrency()

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                    <Label htmlFor="paymentMethod" className="text-sm font-medium">Metode Pembayaran</Label>
                    <select
                        className="w-full p-2 border border-input rounded-md bg-background mt-1"
                        value={formData.payment_method}
                        onChange={(e) => onInputChange('payment_method', e.target.value as PaymentMethod)}
                    >
                        <option value="cash">Tunai</option>
                        <option value="transfer">Transfer Bank</option>
                        <option value="qris">QRIS</option>
                        <option value="card">Kartu Debit/Kredit</option>
                        <option value="ewallet">E-Wallet (GoPay, OVO, dll)</option>
                    </select>
                </div>
                <div>
                    <Label htmlFor="discount" className="text-sm font-medium">Diskon (Rp)</Label>
                    <Input
                        id="discount"
                        type="number"
                        placeholder="0"
                        value={formData.discount}
                        onChange={(e) => onInputChange('discount', safeNumber(e.target.value, 0))}
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
                        onChange={(e) => onInputChange('tax_amount', safeNumber(e.target.value, 0))}
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
                        onChange={(e) => {
                            onInputChange('paid_amount', safeNumber(e.target.value, 0))
                            if (fieldErrors['paid_amount']) { onClearError('paid_amount') }
                        }}
                        min="0"
                        step="1000"
                        className={`mt-1 ${fieldErrors['paid_amount'] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
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
                        <span>{formatCurrency(deliveryFee)}</span>
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
                    <div className="flex justify-between font-medium text-base">
                        <span>Sisa:</span>
                        <span className={totalAmount - formData.paid_amount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                            {formatCurrency(Math.max(0, totalAmount - formData.paid_amount))}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
