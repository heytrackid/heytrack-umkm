'use client'

import { CheckCircle, DollarSign, MapPin, Phone, Users } from '@/components/icons'
import { useUpdateOrder } from '@/hooks/api/useOrders'
import { useQueryClient } from '@tanstack/react-query'
import { memo, useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { useCurrency } from '@/hooks/useCurrency'
import { PAYMENT_METHODS } from '@/lib/shared/constants'
import { getPriorityInfo, getStatusInfo } from '@/modules/orders/utils/helpers'

import type { Row } from '@/types/database'



type Order = Row<'orders'>
type OrderItem = Row<'order_items'>

interface OrderWithItems extends Order {
  order_items?: OrderItem[]
}

interface OrderDetailViewProps {
  order: OrderWithItems
}

const OrderDetailViewComponent = ({ order }: OrderDetailViewProps) => {
  const { formatCurrency } = useCurrency()
  const queryClient = useQueryClient()
  const updateOrderMutation = useUpdateOrder()

  const [currentOrder, setCurrentOrder] = useState<OrderWithItems>(order)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH')
  const [paymentError, setPaymentError] = useState<string | null>(null)

  useEffect(() => {
    setCurrentOrder(order)
  }, [order])
  
  // Memoize expensive calculations
  const statusInfo = useMemo(() => getStatusInfo(currentOrder['status'] ?? 'PENDING'), [currentOrder])
  const priorityInfo = useMemo(() => getPriorityInfo(currentOrder.priority ?? 'MEDIUM'), [currentOrder.priority])
  const orderItems: OrderItem[] = useMemo(() => currentOrder.order_items ?? [], [currentOrder.order_items])
  
  const financialData = useMemo(() => {
    const totalAmount = currentOrder.total_amount ?? 0
    const taxAmount = currentOrder.tax_amount ?? 0
    const discountAmount = currentOrder.discount ?? 0
    const deliveryFee = currentOrder.delivery_fee ?? 0
    const paidAmount = currentOrder.paid_amount ?? 0
    const subtotal = totalAmount - taxAmount + discountAmount - deliveryFee
    const outstandingAmount = totalAmount > paidAmount ? totalAmount - paidAmount : 0
    const totalItemCount = orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    
    let paymentStatus = 'BELUM BAYAR'
    if (paidAmount >= totalAmount) {
      paymentStatus = 'LUNAS'
    } else if (paidAmount > 0) {
      paymentStatus = 'SEBAGIAN'
    }
    
    return {
      totalAmount,
      taxAmount,
      discountAmount,
      deliveryFee,
      paidAmount,
      subtotal,
      outstandingAmount,
      totalItemCount,
      paymentStatus
    }
  }, [currentOrder.total_amount, currentOrder.tax_amount, currentOrder.discount, currentOrder.delivery_fee, currentOrder.paid_amount, orderItems])
  
  const { totalAmount, taxAmount, discountAmount, deliveryFee, paidAmount, subtotal, outstandingAmount, totalItemCount, paymentStatus } = financialData

  const handleClosePaymentModal = useCallback(() => {
    setPaymentDialogOpen(false)
    setPaymentAmount('')
    setPaymentMethod('CASH')
    setPaymentError(null)
  }, [])

  const handleOpenPaymentModal = useCallback(() => {
    setPaymentAmount(outstandingAmount > 0 ? String(outstandingAmount) : '')
    setPaymentMethod((currentOrder.payment_method ?? 'CASH') as string)
    setPaymentError(null)
    setPaymentDialogOpen(true)
  }, [currentOrder.payment_method, outstandingAmount])

  const handleSubmitPayment = useCallback(async () => {
    const amount = Number(paymentAmount)
    if (Number.isNaN(amount) || amount <= 0) {
      setPaymentError('Nominal harus lebih dari 0')
      return
    }

    const currentPaid = Number(currentOrder.paid_amount ?? 0)
    const total = Number(currentOrder.total_amount ?? 0)
    const nextPaid = currentPaid + amount
    const nextStatus = nextPaid >= total ? 'PAID' : 'PARTIAL'

    try {
      const updated = await updateOrderMutation.mutateAsync({
        id: currentOrder.id,
        order: {
          paid_amount: nextPaid,
          payment_status: nextStatus,
          payment_method: paymentMethod
        } as never
      })
      setCurrentOrder((prev) => ({ ...prev, ...updated }))
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      void queryClient.invalidateQueries({ queryKey: ['orders-list'] })
      void queryClient.invalidateQueries({ queryKey: ['order', currentOrder.id] })
      handleClosePaymentModal()
    } catch (err: unknown) {
      setPaymentError(err instanceof Error ? err.message : 'Gagal mencatat pembayaran')
    }
  }, [currentOrder.id, currentOrder.paid_amount, currentOrder.total_amount, handleClosePaymentModal, paymentAmount, paymentMethod, queryClient, updateOrderMutation])

  const handleMarkPaid = useCallback(async () => {
    const total = Number(currentOrder.total_amount ?? 0)
    if (total <= 0) return

    try {
      const updated = await updateOrderMutation.mutateAsync({
        id: currentOrder.id,
        order: {
          paid_amount: total,
          payment_status: 'PAID',
          payment_method: paymentMethod
        } as never
      })
      setCurrentOrder((prev) => ({ ...prev, ...updated }))
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      void queryClient.invalidateQueries({ queryKey: ['orders-list'] })
      void queryClient.invalidateQueries({ queryKey: ['order', currentOrder.id] })
      handleClosePaymentModal()
    } catch (err: unknown) {
      setPaymentError(err instanceof Error ? err.message : 'Gagal menandai lunas')
    }
  }, [currentOrder.id, currentOrder.total_amount, handleClosePaymentModal, paymentMethod, queryClient, updateOrderMutation])

  return (
    <>
      <SwipeableTabs defaultValue="overview" className="w-full">
        <SwipeableTabsList>
          <SwipeableTabsTrigger value="overview" className="text-xs sm:text-sm">Overview</SwipeableTabsTrigger>
          <SwipeableTabsTrigger value="items" className="text-xs sm:text-sm">Item</SwipeableTabsTrigger>
          <SwipeableTabsTrigger value="customer" className="text-xs sm:text-sm">Pelanggan</SwipeableTabsTrigger>
          <SwipeableTabsTrigger value="payment" className="text-xs sm:text-sm">Bayar</SwipeableTabsTrigger>
        </SwipeableTabsList>

        <SwipeableTabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Informasi Pesanan</h3>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">No. Pesanan:</span>
                  <span className="font-mono">{currentOrder['order_no']}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prioritas:</span>
                  <Badge variant="outline" className={priorityInfo.color}>{priorityInfo.label}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Pesan:</span>
                  <span>{currentOrder.order_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Kirim:</span>
                  <span>{currentOrder.delivery_date} {currentOrder.delivery_time ?? ''}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Ringkasan Pembayaran</h3>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diskon:</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pajak:</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Biaya Kirim:</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Dibayar:</span>
                  <span>{formatCurrency(paidAmount)}</span>
                </div>
                {outstandingAmount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sisa:</span>
                    <span>{formatCurrency(outstandingAmount)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {currentOrder.notes && (
          <div>
            <h3 className="font-medium">Catatan</h3>
            <p className="mt-2 text-sm text-muted-foreground p-3 bg-muted rounded-lg">{currentOrder.notes}</p>
          </div>
        )}
      </SwipeableTabsContent>

      <SwipeableTabsContent value="items" className="space-y-4">
        <h3 className="font-medium">Item Pesanan ({orderItems.length})</h3>
        <div className="space-y-2">
          {orderItems.length > 0 ? (
            orderItems.map((item: OrderItem) => {
              const itemKey = item['id'] ?? item.recipe_id ?? `${item.product_name ?? 'item'}-${item.quantity ?? 0}`
              return (
                <div key={itemKey} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity || 0} x {formatCurrency(item.unit_price || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.total_price || 0)}</p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Tidak ada item pesanan
            </div>
          )}
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center font-medium">
            <span>Total Item: {totalItemCount}</span>
            <span>Subtotal: {formatCurrency(subtotal)}</span>
          </div>
        </div>
      </SwipeableTabsContent>

      <SwipeableTabsContent value="customer" className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-3">Informasi Pelanggan</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{currentOrder['customer_name']}</span>
            </div>
            {currentOrder.customer_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{currentOrder.customer_phone}</span>
              </div>
            )}
            {currentOrder.customer_address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{currentOrder.customer_address}</span>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline">
              <Phone className="h-3 w-3 mr-1" />
              Hubungi
            </Button>
            <Button size="sm" variant="outline">
              Edit Pelanggan
            </Button>
          </div>
        </div>
      </SwipeableTabsContent>

      <SwipeableTabsContent value="payment" className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenPaymentModal}
            disabled={updateOrderMutation.isPending || outstandingAmount <= 0}
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Catat Pembayaran
          </Button>
          <Button
            size="sm"
            onClick={handleMarkPaid}
            disabled={updateOrderMutation.isPending || outstandingAmount <= 0}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Tandai Lunas
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{currentOrder.payment_method}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Status Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">
                {paymentStatus}
              </p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Riwayat Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Riwayat pembayaran akan ditampilkan di sini
            </p>
          </CardContent>
        </Card>
        </SwipeableTabsContent>
      </SwipeableTabs>

      <Dialog
        open={paymentDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setPaymentDialogOpen(true)
          } else {
            handleClosePaymentModal()
          }
        }}
      >
        <DialogContent className="w-full max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Catat Pembayaran</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sudah dibayar</span>
                <span className="font-medium">{formatCurrency(paidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sisa</span>
                <span className="font-medium">{formatCurrency(outstandingAmount)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_amount">Nominal diterima</Label>
              <Input
                id="payment_amount"
                type="number"
                min={0}
                value={paymentAmount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPaymentAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Metode pembayaran</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih metode" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m: (typeof PAYMENT_METHODS)[number]) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {paymentError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {paymentError}
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={handleClosePaymentModal}>
                Batal
              </Button>
              <Button
                variant="secondary"
                onClick={handleMarkPaid}
                disabled={updateOrderMutation.isPending || outstandingAmount <= 0}
              >
                Tandai Lunas
              </Button>
              <Button onClick={handleSubmitPayment} disabled={updateOrderMutation.isPending}>
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Memoized export for performance
export const OrderDetailView = memo(OrderDetailViewComponent)
