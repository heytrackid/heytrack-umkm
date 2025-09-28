'use client'

import React, { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettings } from '@/contexts/settings-context'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useResponsive } from '@/hooks/use-mobile'
import { 
  Plus, 
  Users, 
  Search,
  Phone,
  Mail,
  MapPin,
  UserPlus,
  Edit2,
  Trash2,
  RefreshCw
} from 'lucide-react'

export default function CustomersPage() {
  const { isMobile } = useResponsive()
  const { formatCurrency, t } = useSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentView, setCurrentView] = useState('list') // 'list', 'add', 'edit'

  // Mock customer data - replace with actual data fetching
  const [customers] = useState([
    {
      id: 1,
      name: 'Sarah Jessica',
      email: 'sarah@email.com',
      phone: '081234567890',
      address: 'Jl. Merdeka No. 123, Jakarta',
      totalOrders: 15,
      totalSpent: 2450000,
      status: 'active',
      lastOrderDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Ahmad Rahman', 
      email: 'ahmad@email.com',
      phone: '081987654321',
      address: 'Jl. Sudirman No. 45, Bandung',
      totalOrders: 8,
      totalSpent: 1200000,
      status: 'active',
      lastOrderDate: '2024-01-12'
    }
  ])

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  )

  // Breadcrumb component
  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Dashboard', href: '/' },
      { label: 'Data Pelanggan', href: currentView === 'list' ? undefined : '/customers' }
    ]
    
    if (currentView !== 'list') {
      items.push({ 
        label: currentView === 'add' ? 'Tambah Pelanggan' : 'Edit Pelanggan' 
      })
    }
    
    return items
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            {getBreadcrumbItems().map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < getBreadcrumbItems().length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Data Pelanggan
            </h1>
            <p className="text-muted-foreground">
              Kelola database pelanggan dan riwayat pembelian
            </p>
          </div>
          <div className={`flex gap-2 ${isMobile ? 'w-full flex-col' : ''}`}>
            <Button variant="outline" className={isMobile ? 'w-full' : ''}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button className={isMobile ? 'w-full' : ''} onClick={() => setCurrentView('add')}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pelanggan
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {customers.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Pelanggan</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <UserPlus className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {customers.filter(c => c.status === 'active').length}
              </div>
              <p className="text-sm text-muted-foreground">Pelanggan Aktif</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-8 w-8 text-blue-600 mx-auto mb-2 flex items-center justify-center font-bold text-lg">Rp</div>
              <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length)}
              </div>
              <p className="text-sm text-muted-foreground">Rata-rata Belanja</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-8 w-8 text-orange-600 mx-auto mb-2 flex items-center justify-center font-bold text-lg">#</div>
              <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {Math.round(customers.reduce((sum, c) => sum + c.totalOrders, 0) / customers.length)}
              </div>
              <p className="text-sm text-muted-foreground">Rata-rata Order</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari pelanggan berdasarkan nama, email, atau nomor telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer List */}
        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada data pelanggan'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Coba kata kunci lain untuk menemukan pelanggan'
                  : 'Mulai dengan menambahkan data pelanggan pertama'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setCurrentView('add')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pelanggan Pertama
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
                        {customer.name}
                      </CardTitle>
                      <Badge variant={customer.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                        {customer.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="line-clamp-2">{customer.address}</span>
                    </div>
                    
                    <div className="pt-2 border-t space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Total Belanja:</span>
                        <span className="font-medium">{formatCurrency(customer.totalSpent)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Total Order:</span>
                        <span className="font-medium">{customer.totalOrders}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Terakhir Order:</span>
                        <span className="font-medium">{customer.lastOrderDate}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  💡 Tips: Manfaatkan Data Pelanggan
                </h3>
                <div className={`text-sm text-blue-800 dark:text-blue-200 ${isMobile ? 'space-y-1' : 'flex items-center gap-4'}`}>
                  <span>• Lacak riwayat pembelian</span>
                  <span>• Analisa pelanggan terbaik</span>
                  <span>• Personalisasi penawaran</span>
                  <span>• Follow up order berkala</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}