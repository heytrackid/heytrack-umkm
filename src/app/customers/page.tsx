'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import AppLayout from '@/components/layout/app-layout'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { useSettings } from '@/contexts/settings-context'
import { useResponsive } from '@/hooks/use-mobile'
import { useLoading, LOADING_KEYS } from '@/hooks/useLoading'
import { useToast, successToast, errorToast, warningToast, infoToast } from '@/hooks/use-toast'
import { apiCache, CACHE_PATTERNS } from '@/lib/api-cache'
import { useDebounce } from '@/hooks/use-debounce'
import type { CustomersTable } from '@/types/customers'
import { RefreshCw, Plus } from 'lucide-react'

// Import split components
import { CustomerStats } from './components/CustomerStats'
import { CustomerFilters } from './components/CustomerFilters'
import { CustomerBulkActions } from './components/CustomerBulkActions'
import { CustomerTips } from './components/CustomerTips'

// Dynamically import the heavy table component
const CustomersTable = dynamic(() => import('./components/CustomersTable'), {
  loading: () => <div className="animate-pulse h-96 bg-gray-200 rounded-lg" />,
  ssr: false
})

type Customer = CustomersTable['Row']

export default function CustomersPage() {
  const { isMobile } = useResponsive()
  const { formatCurrency } = useSettings()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentView, setCurrentView] = useState('list') // 'list', 'add', 'edit'
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const { loading, setLoading, isLoading } = useLoading({
    [LOADING_KEYS.FETCH_CUSTOMERS]: true
  })

  const [customers, setCustomers] = useState<Customer[]>([])

  // Debounced search term (500ms delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Fetch customer data from API with caching
  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async (search?: string) => {
    try {
      setLoading(LOADING_KEYS.FETCH_CUSTOMERS, true)

      const data = await apiCache.cachedFetch(
        '/api/customers',
        async () => {
          const params = new URLSearchParams()
          if (search) params.append('search', search)

          const response = await fetch(`/api/customers?${params}`)
          if (!response.ok) throw new Error('Failed to fetch customers')
          return response.json()
        },
        search ? { search } : undefined,
        { ttl: 5 * 60 * 1000 } // 5 minutes cache
      )

      setCustomers(data)
    } catch (error: unknown) {
      console.error('Error fetching customers:', error)
      errorToast('Gagal Memuat Data', 'Terjadi kesalahan saat mengambil data pelanggan')
    } finally {
      setLoading(LOADING_KEYS.FETCH_CUSTOMERS, false)
    }
  }

  // Effect untuk search dengan debounce
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return // Skip if still typing

    if (debouncedSearchTerm) {
      fetchCustomers(debouncedSearchTerm)
    } else {
      fetchCustomers()
    }
  }, [debouncedSearchTerm])

  const filteredCustomers = customers.filter((customer: Customer) =>
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
        setLoading(LOADING_KEYS.FETCH_CUSTOMERS, true)

        const deletePromises = selectedItems.map(id =>
          fetch(`/api/customers/${id}`, { method: 'DELETE' })
        )
        await Promise.all(deletePromises)

        // Invalidate cache and refresh data
        apiCache.invalidate(CACHE_PATTERNS.CUSTOMERS || 'customers')

        successToast(
          'Berhasil Dihapus',
          `${selectedItems.length} pelanggan berhasil dihapus`
        )
        setSelectedItems([])
        await fetchCustomers()
      } catch (error: unknown) {
        console.error('Error:', error)
        errorToast('Gagal Menghapus', 'Terjadi kesalahan saat menghapus pelanggan')
      } finally {
        setLoading(LOADING_KEYS.FETCH_CUSTOMERS, false)
      }
    }
  }

  const handleBulkEdit = () => {
    if (selectedItems.length === 0) return

    const selectedCustomers = filteredCustomers.filter(customer => selectedItems.includes(customer.id.toString()))
    const customerNames = selectedCustomers.map(customer => customer.name).join(', ')

    // TODO: Open bulk edit modal
    console.log('Bulk editing customers:', selectedItems)

    warningToast('Fitur Dalam Pengembangan', 'Bulk edit belum tersedia')
  }

  // Individual action handlers
  const handleEditCustomer = (customer: Customer) => {
    console.log('Edit customer:', customer)
    setCurrentView('edit')
    infoToast('Mode Edit', 'Fitur edit pelanggan sedang dalam pengembangan')
  }

  const handleDeleteCustomer = async (customer: Customer) => {
    const confirmed = window.confirm(
      `⚠️ KONFIRMASI PENGHAPUSAN\n\nYakin ingin menghapus pelanggan:\n"${customer.name}"\n\n❗ PERHATIAN: Tindakan ini tidak bisa dibatalkan!`
    )

    if (confirmed) {
      try {
        setLoading(LOADING_KEYS.FETCH_CUSTOMERS, true)

        const response = await fetch(`/api/customers/${customer.id}`, { method: 'DELETE' })
        if (!response.ok) throw new Error('Failed')

        // Invalidate cache
        apiCache.invalidate(CACHE_PATTERNS.CUSTOMERS || 'customers')

        successToast('Berhasil Dihapus', `Pelanggan "${customer.name}" berhasil dihapus`)
        await fetchCustomers()
      } catch (error: unknown) {
        console.error('Error:', error)
        errorToast('Gagal Menghapus', 'Terjadi kesalahan saat menghapus pelanggan')
      } finally {
        setLoading(LOADING_KEYS.FETCH_CUSTOMERS, false)
      }
    }
  }

  const handleViewCustomer = (customer: Customer) => {
    console.log('View customer details:', customer)
    // TODO: Open customer detail modal or navigate to customer detail page
    infoToast('Detail Pelanggan', `Melihat detail pelanggan: ${customer.name}`)
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
            <Button
              className={isMobile ? 'w-full' : ''}
              onClick={() => fetchCustomers()}
              disabled={isLoading(LOADING_KEYS.FETCH_CUSTOMERS)}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading(LOADING_KEYS.FETCH_CUSTOMERS) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className={isMobile ? 'w-full' : ''} onClick={() => setCurrentView('add')}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pelanggan
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <CustomerStats
          customers={customers}
          isLoading={isLoading(LOADING_KEYS.FETCH_CUSTOMERS)}
        />

        {/* Search and Filters */}
        <CustomerFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isLoading={isLoading(LOADING_KEYS.FETCH_CUSTOMERS)}
        />

        {/* Bulk Actions */}
        <CustomerBulkActions
          selectedItems={selectedItems}
          filteredCustomers={filteredCustomers}
          onClearSelection={() => setSelectedItems([])}
          onBulkEdit={handleBulkEdit}
          onBulkDelete={handleBulkDelete}
          isLoading={isLoading(LOADING_KEYS.FETCH_CUSTOMERS)}
        />

        {/* Customers Table */}
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

        {/* Info Card */}
        <CustomerTips />
      </div>
    </AppLayout>
  )
}
