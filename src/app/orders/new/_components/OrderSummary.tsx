'use client'

import { Calculator, Save } from 'lucide-react'

import type { OrderFormData, OrderItem } from '@/app/orders/new/hooks/useOrderLogic'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'

import type { FormEvent } from 'react'



interface OrderSummaryProps {
  formData: OrderFormData
  orderItems: OrderItem[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  isSubmitting: boolean
  onSubmit: (e: FormEvent) => void
  onCancel: () => void
}

const OrderSummary = ({
  formData,
  orderItems,
  subtotal,
  taxAmount,
  totalAmount,
  isSubmitting,
  onSubmit,
  onCancel
}: OrderSummaryProps) => {
  const { formatCurrency } = useCurrency()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Ringkasan Pesanan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Diskon:</span>
              <span>- {formatCurrency(formData.discount_amount)}</span>
            </div>

            <div className="flex justify-between">
              <span>Pajak ({formData.tax_rate}%):</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>

            {formData.delivery_method === 'delivery' && (
              <div className="flex justify-between">
                <span>Biaya Kirim:</span>
                <span>{formatCurrency(formData.delivery_fee)}</span>
              </div>
            )}

            <hr className="my-2" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>{orderItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Qty Total:</span>
                <span>{orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Status Awal:</span>
                <Badge variant="outline">PENDING</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || orderItems.length === 0}
            >
              {isSubmitting ? (
                <>Menyimpan...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Pesanan
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onCancel}
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default OrderSummary
