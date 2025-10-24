// Customers Layout Component - Main Page with Lazy Components
// Main layout component that orchestrates all lazy-loaded customer management components

'use client'

import { useState, useEffect, useMemo } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { CustomersTableSkeleton } from '@/components/ui/skeletons/table-skeletons'
import { StatsCardSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'
import { useSettings } from '@/contexts/settings-context'
import { LOADING_KEYS, useLoading } from '@/hooks/useLoading'
import { useResponsive } from '@/hooks/useResponsive'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'
import { apiLogger } from '@/lib/logger'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Plus, RefreshCw, Users } from 'lucide-react'
import * as React from 'react'

// Lazy load components
import dynamic from 'next/dynamic'

const CustomersTable = dynamic(() => import('./CustomersTable'), {
  loading: () => <CustomersTableSkeleton rows={10} />,
  ssr: false
})

const CustomerStats = dynamic(() => import('./CustomerStats'), {
  loading: () => <StatsCardSkeleton />
})

const CustomerSearchFilters = dynamic(() => import('./CustomerSearchFilters'), {
  loading: () => <div>Loading search...</div>
})

import type { Customer } from './types'

export default function CustomersLayout() {
  const router = useRouter()
  const { isMobile } = useResponsive()
  const { formatCurrency } = useSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [currentView, setCurrentView] = useState('list') // 'list', 'add', 'edit'
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const { setLoading, isLoading } = useLoading({
    [LOADING_KEYS.FETCH_CUSTOMERS]: true
  })

  const [customers, setCustomers] = useState<Customer[]>([])
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
    } catch (error: unknown) {
      apiLogger.error({ error }, 'Error fetching customers:')
      toast({
        title: 'Terjadi kesalahan',
        description: 'Gagal memuat data pelanggan. Silakan coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setLoading(LOADING_KEYS.FETCH_CUSTOMERS, false)
    }
  }

  const filteredCustomers = useMemo(() =>
    customers.filter((customer: Customer) =>
      customer.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      customer.phone?.includes(debouncedSearchTerm)
    ), [customers, debouncedSearchTerm]
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
        toast({
          title: 'Berhasil',
          description: `Berhasil menghapus ${selectedItems.length} pelanggan`,
          variant: 'default',
        })
        setSelectedItems([])
        fetchCustomers()
      } catch (error: unknown) {
        apiLogger.error({ error }, 'Error:')
        toast({
          title: 'Gagal',
          description: 'Gagal menghapus pelanggan',
          variant: 'destructive',
        })
      }
    }
  }

  const handleBulkEdit = () => {
    if (selectedItems.length === 0) return

    const selectedCustomers = filteredCustomers.filter(customer => selectedItems.includes(customer.id.toString()))

    toast({
      title: 'Informasi',
      description: `Bulk edit untuk ${selectedItems.length} pelanggan akan segera tersedia`,
      variant: 'default',
    })
  }

  // Individual action handlers
  const handleEditCustomer = (customer: Customer) => {
    apiLogger.info({ customer }, 'Edit customer')
    setCurrentView('edit')
  }

  const handleDeleteCustomer = async (customer: Customer) => {
    const confirmed = window.confirm(
      `⚠️ KONFIRMASI PENGHAPUSAN\n\nYakin ingin menghapus pelanggan:\n"${customer.name}"\n\n❗ PERHATIAN: Tindakan ini tidak bisa dibatalkan!`
    )

    if (confirmed) {
      try {
        const response = await fetch(`/api/customers/${customer.id}`, { method: 'DELETE' })
        if (!response.ok) throw new Error('Failed')
        toast({
          title: 'Berhasil',
          description: 'Pelanggan berhasil dihapus',
          variant: 'default',
        })
        fetchCustomers()
      } catch (error: unknown) {
        apiLogger.error({ error }, 'Error:')
        toast({
          title: 'Gagal',
          description: 'Gagal menghapus pelanggan',
          variant: 'destructive',
        })
      }
    }
  }

  const handleViewCustomer = (customer: Customer) => {
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
            {getBreadcrumbItems().map((item, index) => (
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

        {/* Customer Stats - Lazy Loaded */}
        <CustomerStats
          customers={customers}
          isLoading={isLoading(LOADING_KEYS.FETCH_CUSTOMERS)}
          isMobile={isMobile}
        />

        {/* Customer Search and Filters - Lazy Loaded */}
        <CustomerSearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filteredCustomers={filteredCustomers}
          selectedItems={selectedItems}
          onClearSelection={() => setSelectedItems([])}
          onBulkEdit={handleBulkEdit}
          onBulkDelete={handleBulkDelete}
          isLoading={isLoading(LOADING_KEYS.FETCH_CUSTOMERS)}
        />

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
