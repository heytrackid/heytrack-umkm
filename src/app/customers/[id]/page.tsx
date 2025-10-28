'use client'

import AppLayout from '@/components/layout/app-layout'
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { ProfileSkeleton, CardSkeleton } from '@/components/ui'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrency } from '@/hooks/useCurrency'
import { useSupabaseQuery, useSupabaseCRUD } from '@/hooks/supabase'
import {
  ArrowLeft,
  Edit,
  Mail,
  MapPin,
  Phone,
  ShoppingCart,
  Trash2,
  TrendingUp,
  User
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { formatCurrency } = useCurrency()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch customer data
  const { data: customers, loading: customerLoading } = useSupabaseQuery('customers', {
    filter: { id }
  })
  const customer = customers?.[0]

  // CRUD operations
  const { delete: deleteCustomer } = useSupabaseCRUD('customers')

  // Fetch customer orders
  const { data: orders, loading: ordersLoading } = useSupabaseQuery('orders', {
    filter: { customer_id: id },
    orderBy: { column: 'created_at', ascending: false }
  })

  const handleDelete = async () => {
    try {
      await deleteCustomer(id)
      toast.success('Pelanggan berhasil dihapus')
      void router.push('/customers')
    } catch (err) {
      toast.error('Gagal menghapus pelanggan')
    }
  }

  if (customerLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <ProfileSkeleton />
          <CardSkeleton rows={4} />
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
    totalOrders: customer.total_orders || 0,
    totalSpent: customer.total_spent || 0,
    averageOrder: (customer.total_orders || 0) > 0 ? (customer.total_spent || 0) / (customer.total_orders || 0) : 0,
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

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{customer.name}</h1>
              <p className="text-muted-foreground">Detail Pelanggan</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/customers/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </div>
        </div>

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
                  {customer.customer_type?.toUpperCase() || 'REGULAR'}
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
            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    <div>
                      <p className="font-medium">{order.order_no}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at || '').toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(order.total_amount ?? 0)}</p>
                      <Badge variant={
                        order.status === 'DELIVERED' ? 'default' :
                          order.status === 'CANCELLED' ? 'destructive' :
                            'secondary'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Belum ada riwayat pesanan
              </p>
            )}
          </CardContent>
        </Card>

        <ConfirmDialog
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
