'use client'

import { ArrowLeft, Edit, Mail, MapPin, Phone, ShoppingCart, Trash2, TrendingUp, User } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { use, useState } from 'react'
import { handleError } from '@/lib/error-handling'
import { toast } from 'sonner'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrency } from '@/hooks/useCurrency'
import { useCustomer, useDeleteCustomer } from '@/hooks/useCustomers'
import { useOrders } from '@/hooks/api/useOrders'
import type { OrderListItem } from '@/types/database'

// Helper function to get status variant
const getStatusVariant = (status: string): "default" | "destructive" | "secondary" => {
  switch (status) {
    case 'DELIVERED':
      return 'default'
    case 'CANCELLED':
      return 'destructive'
    default:
      return 'secondary'
  }
}

import type { Row } from '@/types/database'

type Customer = Row<'customers'>

const CustomerDetailPage = ({ params }: { params: Promise<{ id: string }> }): JSX.Element => {
  const { id } = use(params)
  const router = useRouter()
  const { formatCurrency } = useCurrency()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch customer data
  const { data: customerData, isLoading: customerLoading } = useCustomer(id)
  const customer = customerData as Customer | undefined

  // CRUD operations
  const deleteCustomerMutation = useDeleteCustomer()

  // Fetch customer orders
  const { data: allOrders = [], isLoading: ordersLoading } = useOrders()
  const orders = allOrders.filter(order => order.customer_id === id)

  const handleDelete = async (): Promise<void> => {
    try {
      await deleteCustomerMutation.mutateAsync(id)
      toast.success('Pelanggan berhasil dihapus')
      router.push('/customers')
    } catch (error) {
      handleError(error, 'Delete customer', true, 'Gagal menghapus pelanggan')
    }
  }

  if (customerLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    )
  }

  if (!customer) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Pelanggan tidak ditemukan</p>
          <Button onClick={() => router.push('/customers')} className="mt-4">
            Kembali ke Daftar Pelanggan
          </Button>
        </div>
      </AppLayout>
    )
  }

  const stats = {
    totalOrders: customer.total_orders ?? 0,
    totalSpent: customer.total_spent ?? 0,
    averageOrder: (customer.total_orders ?? 0) > 0 ? (customer.total_spent ?? 0) / (customer.total_orders ?? 0) : 0,
    lastOrder: customer.last_order_date
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <PrefetchLink href="/">Dashboard</PrefetchLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <PrefetchLink href="/customers">Pelanggan</PrefetchLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{customer.name}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        <PageHeader
          title={customer.name}
          description="Detail Pelanggan"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Pelanggan', href: '/customers' },
            { label: customer.name }
          ]}
          actions={
            <>
              <Button variant="outline" onClick={() => router.push(`/customers/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Telepon</p>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  </div>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Alamat</p>
                    <p className="text-sm text-muted-foreground">{customer.address}</p>
                  </div>
                </div>
              )}
              <div className="pt-4 border-t">
                <Badge variant={customer.customer_type === 'vip' ? 'default' : 'secondary'}>
                  {customer.customer_type?.toUpperCase() ?? 'REGULAR'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Statistik Pembelian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Pesanan</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Belanja</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Rata-rata Order</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.averageOrder)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pesanan Terakhir</p>
                  <p className="text-sm font-medium">
                    {stats.lastOrder
                      ? new Date(stats.lastOrder).toLocaleDateString('id-ID')
                      : '-'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Riwayat Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              if (ordersLoading) {
                return (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
                  </div>
                )
              }
              if (orders?.length) {
                return (
                  <div className="space-y-3">
                    {(orders as unknown as OrderListItem[]).map((order: OrderListItem) => (
                       <div
                         key={order['id']}
                         className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                         role="button"
                         tabIndex={0}
                         onClick={() => router.push(`/orders/${order['id']}`)}
                         onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { router.push(`/orders/${order['id']}`); e.preventDefault(); } }}
                       >
                        <div>
                          <p className="font-medium">{order['order_no']}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at ?? '').toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(order.total_amount ?? 0)}</p>
                          <Badge variant={getStatusVariant(order['status'] ?? 'PENDING')}>
                            {order['status'] ?? 'PENDING'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
              return (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada riwayat pesanan
                </p>
              )
            })()}
          </CardContent>
        </Card>

        <ConfirmationDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          onConfirm={handleDelete}
          title="Hapus Pelanggan"
          description="Apakah Anda yakin ingin menghapus pelanggan ini? Tindakan ini tidak dapat dibatalkan."
        />
      </div>
    </AppLayout>
  )
}

export default CustomerDetailPage
