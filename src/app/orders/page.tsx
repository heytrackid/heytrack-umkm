'use client'

import React, { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Clock,
  Eye,
  MessageCircle,
  Package
} from 'lucide-react'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Mock data
const mockOrders = [
  {
    id: '1',
    order_number: 'ORD00001234',
    customer_name: 'Ibu Sari',
    customer_phone: '08123456789',
    status: 'confirmed',
    order_date: '2025-09-29',
    due_date: '2025-10-02',
    items: [{ name: 'Roti Tawar Premium', quantity: 2 }],
    total_amount: 55500,
    payment_status: 'unpaid'
  },
  {
    id: '2', 
    order_number: 'ORD00001235',
    customer_name: 'Pak Budi',
    customer_phone: '08129876543',
    status: 'in_production',
    order_date: '2025-09-28',
    due_date: '2025-10-01',
    items: [{ name: 'Kue Ulang Tahun', quantity: 1 }],
    total_amount: 166500,
    payment_status: 'partial'
  }
]

const ORDER_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  confirmed: { label: 'Dikonfirmasi', color: 'bg-gray-200 text-gray-900' },
  in_production: { label: 'Sedang Diproduksi', color: 'bg-gray-300 text-gray-900' },
  completed: { label: 'Selesai', color: 'bg-gray-400 text-white' },
  cancelled: { label: 'Dibatalkan', color: 'bg-gray-500 text-white' }
}

const PAYMENT_STATUS_CONFIG = {
  unpaid: { label: 'Belum Dibayar', color: 'bg-gray-100 text-gray-800' },
  partial: { label: 'Dibayar Sebagian', color: 'bg-gray-200 text-gray-900' },
  paid: { label: 'Lunas', color: 'bg-gray-300 text-gray-900' }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short', 
      year: 'numeric'
    })
  }
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesDateFrom = !dateFrom || order.order_date >= dateFrom
    const matchesDateTo = !dateTo || order.order_date <= dateTo
    
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo
  })
  
  // Stats calculations
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const pendingRevenue = orders.filter(o => o.payment_status === 'unpaid').reduce((sum, o) => sum + o.total_amount, 0)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              Order Management
            </h1>
            <p className="text-muted-foreground">
              Kelola pesanan dan penjualan dengan sistem terintegrasi
            </p>
          </div>
          <Button onClick={() => window.location.href = '/orders/new'}>
            <Plus className="h-4 w-4 mr-2" />
            Pesanan Baru
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Pesanan</p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    +18.7% dari periode sebelumnya
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    +23.2% dari periode sebelumnya
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rata-rata Nilai</p>
                  <p className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">per pesanan</p>
                </div>
                <Package className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(pendingRevenue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">belum dibayar</p>
                </div>
                <Clock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/settings/whatsapp-templates'}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Kelola Template WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => console.log('Export orders')}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari customer atau nomor pesanan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder="Dari tanggal"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-[140px]"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  placeholder="Sampai tanggal"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-[140px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Orders Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(order.order_date)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.items.map(item => `${item.quantity} produk (${item.quantity} qty)`).join(', ')}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>{formatDate(order.due_date)}</TableCell>
                  <TableCell>
                    <Badge className={ORDER_STATUS_CONFIG[order.status].color}>
                      {ORDER_STATUS_CONFIG[order.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={PAYMENT_STATUS_CONFIG[order.payment_status].color}>
                      {PAYMENT_STATUS_CONFIG[order.payment_status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select defaultValue={order.status}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => (
                            <SelectItem key={status} value={status}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppLayout>
  )
}
