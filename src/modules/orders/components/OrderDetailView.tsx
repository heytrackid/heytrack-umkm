'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCurrency } from '@/hooks/useCurrency'
import { MapPin, Phone, Users } from 'lucide-react'
import { useMemo } from 'react'
import type { Order, OrderItem } from '@/types'
import { getPriorityInfo, getStatusInfo } from '../utils/helpers'

interface OrderDetailViewProps {
  order: Order
}

export const OrderDetailView = ({ order }: OrderDetailViewProps) => {
  const { formatCurrency } = useCurrency()
  const statusInfo = getStatusInfo(order.status)
  const priorityInfo = getPriorityInfo(order.priority)

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
        <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
        <TabsTrigger value="items" className="text-xs sm:text-sm">Item</TabsTrigger>
        <TabsTrigger value="customer" className="text-xs sm:text-sm">Pelanggan</TabsTrigger>
        <TabsTrigger value="payment" className="text-xs sm:text-sm">Bayar</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
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
                  <span>{order.delivery_date} {order.delivery_time}</span>
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
                  <span>{formatCurrency((order.total_amount || 0) - (order.tax_amount || 0) + (order.discount || 0) - (order.delivery_fee || 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diskon:</span>
                  <span>- {formatCurrency(order.discount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pajak:</span>
                  <span>{formatCurrency(order.tax_amount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Biaya Kirim:</span>
                  <span>{formatCurrency(order.delivery_fee || 0)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total_amount || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Dibayar:</span>
                  <span>{formatCurrency(order.paid_amount || 0)}</span>
                </div>
                {(order.total_amount || 0) > (order.paid_amount || 0) && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Sisa:</span>
                    <span>{formatCurrency((order.total_amount || 0) - (order.paid_amount || 0))}</span>
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
      </TabsContent>

      <TabsContent value="items" className="space-y-4">
        <h3 className="font-medium">Item Pesanan ({order.order_items?.length || 0})</h3>
        <div className="space-y-2">
          {order.order_items?.map((item: OrderItem, index: number) => (
            <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} x {formatCurrency(item.unit_price || 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(item.total_price || 0)}</p>
              </div>
            </div>
          )) || (
              <div className="text-center py-4 text-muted-foreground">
                Tidak ada item pesanan
              </div>
            )}
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center font-medium">
            <span>Total Item: {useMemo(() => order.order_items?.reduce((sum: number, item: OrderItem) => sum + (item.quantity || 0), 0) || 0, [order.order_items])}</span>
            <span>Subtotal: {useMemo(() => formatCurrency((order.total_amount || 0) - (order.tax_amount || 0) + (order.discount || 0) - (order.delivery_fee || 0)), [order.total_amount, order.tax_amount, order.discount, order.delivery_fee])}</span>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="customer" className="space-y-4">
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
      </TabsContent>

      <TabsContent value="payment" className="space-y-4">
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
                {(order.paid_amount || 0) >= (order.total_amount || 0) ? 'LUNAS' :
                  (order.paid_amount || 0) > 0 ? 'SEBAGIAN' : 'BELUM BAYAR'}
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
      </TabsContent>
    </Tabs>
  )
}
