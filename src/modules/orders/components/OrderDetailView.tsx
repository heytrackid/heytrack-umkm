'use client'

import { Badge } from '@/components/ui/badge'
import type { OrdersTable, OrderItemsTable } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { useCurrency } from '@/hooks/useCurrency'
import { MapPin, Phone, Users } from 'lucide-react'
import { getPriorityInfo, getStatusInfo } from '../utils/helpers'



type Order = OrdersTable
type OrderItem = OrderItemsTable

interface OrderWithItems extends Order {
  order_items?: OrderItem[]
}

interface OrderDetailViewProps {
  order: OrderWithItems
}

export const OrderDetailView = ({ order }: OrderDetailViewProps) => {
  const { formatCurrency } = useCurrency()
  const statusInfo = getStatusInfo(order.status ?? 'PENDING')
  const priorityInfo = getPriorityInfo(order.priority ?? 'MEDIUM')
  const orderItems: OrderItem[] = order.order_items ?? []
  const totalAmount = order.total_amount ?? 0
  const taxAmount = order.tax_amount ?? 0
  const discountAmount = order.discount ?? 0
  const deliveryFee = order.delivery_fee ?? 0
  const paidAmount = order.paid_amount ?? 0
  const subtotal = totalAmount - taxAmount + discountAmount - deliveryFee
  const outstandingAmount = totalAmount > paidAmount ? totalAmount - paidAmount : 0
  const totalItemCount = orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
  let paymentStatus = 'BELUM BAYAR'
  if (paidAmount >= totalAmount) {
    paymentStatus = 'LUNAS'
  } else if (paidAmount > 0) {
    paymentStatus = 'SEBAGIAN'
  }

  return (
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
                  <span className="font-mono">{order.order_no}</span>
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
                  <span>{order.order_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Kirim:</span>
                  <span>{order.delivery_date} {order.delivery_time ?? ''}</span>
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
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Dibayar:</span>
                  <span>{formatCurrency(paidAmount)}</span>
                </div>
                {outstandingAmount > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Sisa:</span>
                    <span>{formatCurrency(outstandingAmount)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {order.notes && (
          <div>
            <h3 className="font-medium">Catatan</h3>
            <p className="mt-2 text-sm text-muted-foreground p-3 bg-muted rounded-lg">{order.notes}</p>
          </div>
        )}
      </SwipeableTabsContent>

      <SwipeableTabsContent value="items" className="space-y-4">
        <h3 className="font-medium">Item Pesanan ({orderItems.length})</h3>
        <div className="space-y-2">
          {orderItems.length > 0 ? (
            orderItems.map((item: OrderItem) => {
              const itemKey = item.id ?? item.recipe_id ?? `${item.product_name ?? 'item'}-${item.quantity ?? 0}`
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
              <span className="font-medium">{order.customer_name}</span>
            </div>
            {order.customer_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{order.customer_phone}</span>
              </div>
            )}
            {order.customer_address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{order.customer_address}</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{order.payment_method}</p>
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
  )
}
