'use client'

import AppLayout from '@/components/layout/app-layout'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import {
  StatsCardSkeleton
} from '@/components/ui/skeletons/dashboard-skeletons'
import {
  CustomersTableSkeleton,
  SearchFormSkeleton
} from '@/components/ui/skeletons/table-skeletons'
import { useSettings } from '@/contexts/settings-context'
import { LOADING_KEYS, useLoading } from '@/hooks/useLoading'
import { useResponsive } from '@/hooks/useResponsive'
import {
  Edit2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  Users
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDebounce } from '../../shared/hooks'

// Dynamically import the heavy table component
const CustomersTable = dynamic(() => import('./components/CustomersTable'), {
  loading: () => <CustomersTableSkeleton rows={10} />,
  ssr: false
})
export default function CustomersPage() {
  const router = useRouter()
  const { isMobile } = useResponsive()
  const { formatCurrency, settings } = useSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [currentView, setCurrentView] = useState('list') // 'list', 'add', 'edit'
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const { setLoading, isLoading } = useLoading({
    [LOADING_KEYS.FETCH_CUSTOMERS]: true
  })



  const [customers, setCustomers] = useState<any[]>([])
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Handle auth errors
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({
        title: 'Sesi berakhir',
        description: 'Sesi Anda telah berakhir. Silakan login kembali.',
        variant: 'destructive',
      })
      router.push('/auth/login')
    }
  }, [isAuthLoading, isAuthenticated, router, toast])

  // Fetch customer data from API
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchCustomers()
    }
  }, [isAuthLoading, isAuthenticated])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')

      if (response.status === 401) {
        toast({
          title: 'Sesi berakhir',
          description: 'Sesi Anda telah berakhir. Silakan login kembali.',
          variant: 'destructive',
        })
        router.push('/auth/login')
        return
      }

      if (!response.ok) throw new Error('Failed to fetch customers')
      const data = await response.json()
      setCustomers(data)
    } catch (error: any) {
      console.error('Error fetching customers:', error)
      toast({
        title: 'Terjadi kesalahan',
        description: 'Gagal memuat data pelanggan. Silakan coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setLoading(LOADING_KEYS.FETCH_CUSTOMERS, false)
    }
  }

  const filteredCustomers = customers.filter((customer: any) =>
    customer.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    customer.phone?.includes(debouncedSearchTerm)
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
        toast.success(`Berhasil menghapus ${selectedItems.length} pelanggan`)
        setSelectedItems([])
        fetchCustomers()
      } catch (error: any) {
        console.error('Error:', error)
        toast.error('Gagal menghapus pelanggan')
      }
    }
  }

  const handleBulkEdit = () => {
    if (selectedItems.length === 0) return

    const selectedCustomers = filteredCustomers.filter(customer => selectedItems.includes(customer.id.toString()))

    toast(`Bulk edit untuk ${selectedItems.length} pelanggan akan segera tersedia`, { icon: 'ℹ️' })
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
        toast.success('Pelanggan berhasil dihapus')
        fetchCustomers()
      } catch (error: any) {
        console.error('Error:', error)
        toast.error('Gagal menghapus pelanggan')
      }
    }
  }

  const handleViewCustomer = (customer: any) => {
    router.push(`/customers/${customer.id}`)
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

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <PrefetchLink href="/">Dashboard</PrefetchLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Pelanggan</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Data Pelanggan</h1>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
          <CustomersTableSkeleton rows={5} />
        </div>
      </AppLayout>
    )
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
                      <PrefetchLink href={item.href}>
                        {item.label}
                      </PrefetchLink>
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
                  {customers.filter(c => c.status === 'active').length}
                </div>
                <p className="text-sm text-muted-foreground">Pelanggan Aktif</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="h-8 w-8 text-blue-600 mx-auto mb-2 flex items-center justify-center font-bold text-lg">{settings.currency.symbol}</div>
                <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  {formatCurrency(customers.length > 0 ? customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / customers.length : 0)}
                </div>
                <p className="text-sm text-muted-foreground">Rata-rata Belanja</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="h-8 w-8 text-orange-600 mx-auto mb-2 flex items-center justify-center font-bold text-lg">#</div>
                <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  {Math.round(customers.length > 0 ? customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0) / customers.length : 0)}
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input

                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {selectedItems.length} pelanggan dipilih
                  </span>
                  <span className="text-xs text-gray-500">
                    ({filteredCustomers.filter(customer => selectedItems.includes(customer.id.toString())).map(customer => customer.name).slice(0, 2).join(', ')}
                    {selectedItems.length > 2 ? ` +${selectedItems.length - 2} lainnya` : ''})
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Button

                    size="sm"
                    onClick={() => setSelectedItems([])}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Batal
                  </Button>
                  <Button

                    size="sm"
                    onClick={handleBulkEdit}
                  >
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
              </div>
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
