'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSettings } from '@/contexts/settings-context'
import { useLoading, LOADING_KEYS } from '@/hooks/useLoading'
import { 
  StatsCardSkeleton,
  DashboardHeaderSkeleton
} from '@/components/ui/skeletons/dashboard-skeletons'
import { 
  CustomersTableSkeleton,
  SearchFormSkeleton
} from '@/components/ui/skeletons/table-skeletons'
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
import { Badge } from '@/components/ui/badge'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { useResponsive } from '@/hooks/use-mobile'
import { 
  Plus, 
  Users, 
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  UserPlus
} from 'lucide-react'

// Dynamically import the heavy table component
const CustomersTable = dynamic(() => import('./components/CustomersTable'), {
  loading: () => <CustomersTableSkeleton rows={10} />,
  ssr: false
})
export default function CustomersPage() {
  const { isMobile } = useResponsive()
  const { formatCurrency, settings } = useSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentView, setCurrentView] = useState('list') // 'list', 'add', 'edit'
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const { loading, setLoading, isLoading } = useLoading({
    [LOADING_KEYS.FETCH_CUSTOMERS]: true
  })



  const [customers, setCustomers] = useState<any[]>([])

  // Fetch customer data from API
  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (!response.ok) throw new Error('Failed to fetch customers')
      const data = await response.json()
      setCustomers(data)
    } catch (error: any) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(LOADING_KEYS.FETCH_CUSTOMERS, false)
    }
  }

  const filteredCustomers = customers.filter((customer: any) =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  )

  // Bulk action handlers
  const handleSelectAll = () => {
    if (selectedItems.length === filteredCustomers.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredCustomers.map(customer => customer.id.toString()))
    }
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return
    
    const selectedCustomers = filteredCustomers.filter(customer => selectedItems.includes(customer.id.toString()))
    const customerNames = selectedCustomers.map(customer => customer.name).join(', ')
    
    const confirmed = window.confirm(
      `⚠️ Yakin ingin menghapus ${selectedItems.length} pelanggan berikut?\n\n${customerNames}\n\n❗ Tindakan ini tidak bisa dibatalkan!`
    )
    
    if (confirmed) {
      try {
        const deletePromises = selectedItems.map(id =>
          fetch(`/api/customers/${id}`, { method: 'DELETE' })
        )
        await Promise.all(deletePromises)
        alert(`Berhasil menghapus ${selectedItems.length} pelanggan`)
        setSelectedItems([])
        fetchCustomers()
      } catch (error: any) {
        console.error('Error:', error)
        alert('Gagal menghapus pelanggan')
      }
    }
  }

  const handleBulkEdit = () => {
    if (selectedItems.length === 0) return
    
    const selectedCustomers = filteredCustomers.filter(customer => selectedItems.includes(customer.id.toString()))
    const customerNames = selectedCustomers.map(customer => customer.name).join(', ')
    
    // TODO: Open bulk edit modal
    console.log('Bulk editing customers:', selectedItems)
    
    alert("Pesan")
  }

  // Individual action handlers
  const handleEditCustomer = (customer: any) => {
    console.log('Edit customer:', customer)
    setCurrentView('edit')
  }

  const handleDeleteCustomer = async (customer: any) => {
    const confirmed = window.confirm(
      `⚠️ KONFIRMASI PENGHAPUSAN\n\nYakin ingin menghapus pelanggan:\n"${customer.name}"\n\n❗ PERHATIAN: Tindakan ini tidak bisa dibatalkan!`
    )
    
    if (confirmed) {
      try {
        const response = await fetch(`/api/customers/${customer.id}`, { method: 'DELETE' })
        if (!response.ok) throw new Error('Failed')
        alert("Pesan")
        fetchCustomers()
      } catch (error: any) {
        console.error('Error:', error)
        alert("Pesan")
      }
    }
  }

  const handleViewCustomer = (customer: any) => {
    console.log('View customer details:', customer)
    // TODO: Open customer detail modal or navigate to customer detail page
    alert("Pesan")
  }

  // Breadcrumb component
  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Dashboard', href: '/' },
      { label: 'Data Pelanggan', href: currentView === 'list' ? undefined : '/customers' }
    ]
    
    if (currentView !== 'list') {
      items.push({ 
        label: currentView === 'add' ? 'Tambah Pelanggan' : 'Edit Pelanggan',
        href: undefined
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
            {getBreadcrumbItems().map((item, index: number) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <PrefetchLink href={item.href}>{item.label}</PrefetchLink>
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
            <Button className={isMobile ? 'w-full' : ''}>
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
        {isLoading(LOADING_KEYS.FETCH_CUSTOMERS) ? (
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
            {Array.from({ length: 4 }, (_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        ) : (
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
                  {customers.filter((c) => c.status === 'active').length}
                </div>
                <p className="text-sm text-muted-foreground">Pelanggan Aktif</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="h-8 w-8 text-blue-600 mx-auto mb-2 flex items-center justify-center font-bold text-lg">
                  {settings.currency.symbol}
                </div>
                <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  {formatCurrency(
                    customers.reduce((sum, c) => sum + c.totalSpent, 0) / Math.max(customers.length, 1)
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Rata-rata Belanja</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="h-8 w-8 text-orange-600 mx-auto mb-2 flex items-center justify-center font-bold text-lg">#</div>
                <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  {Math.round(
                    customers.reduce((sum, c) => sum + c.totalOrders, 0) / Math.max(customers.length, 1)
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Rata-rata Order</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        {isLoading(LOADING_KEYS.FETCH_CUSTOMERS) ? (
          <SearchFormSkeleton />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {selectedItems.length > 0 && (
              <Alert>
                <AlertDescription className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-gray-900">
                      {selectedItems.length} pelanggan dipilih
                    </span>
                    <span className="text-xs text-gray-500">
                      ({filteredCustomers
                        .filter((customer) => selectedItems.includes(customer.id.toString()))
                        .map((customer) => customer.name)
                        .slice(0, 2)
                        .join(', ')}
                      {selectedItems.length > 2 ? ` +${selectedItems.length - 2} lainnya` : ''})
                    </span>
                  </div>

                  <div className="ml-auto flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedItems([])}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Batal
                    </Button>
                    <Button size="sm" onClick={handleBulkEdit}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Semua
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleBulkDelete}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus Semua
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Customers Table */}
        {isLoading(LOADING_KEYS.FETCH_CUSTOMERS) ? (
          <CustomersTableSkeleton rows={5} />
        ) : (
          <CustomersTable
            customers={filteredCustomers}
            selectedItems={selectedItems}
            onSelectItem={handleSelectItem}
            onSelectAll={handleSelectAll}
            onView={handleViewCustomer}
            onEdit={handleEditCustomer}
            onDelete={handleDeleteCustomer}
            onAddNew={() => setCurrentView('add')}
            formatCurrency={formatCurrency}
            isMobile={isMobile}
          />
        )}

        {/* Info Card */}
        <Alert>
          <AlertDescription>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  💡 Tips: Manfaatkan Data Pelanggan
                </h3>
                <div className={`text-sm text-blue-800 dark:text-blue-200 ${isMobile ? 'space-y-1' : 'flex flex-wrap gap-4'}`}>
                  <span>• Lacak riwayat pembelian</span>
                  <span>• Analisa pelanggan terbaik</span>
                  <span>• Personalisasi penawaran</span>
                  <span>• Follow up order berkala</span>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </AppLayout>
  )
}