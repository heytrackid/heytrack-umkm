// Customers Layout Component - Main Page with Lazy Components
// Main layout component that orchestrates all lazy-loaded customer management components

'use client'

import AppLayout from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { CustomersTableSkeleton } from '@/components/ui/skeletons/table-skeletons'
import { useSettings } from '@/contexts/settings-context'
import { LOADING_KEYS, useLoading } from '@/hooks/loading'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagination } from '@/hooks/usePagination'
import { useResponsive } from '@/hooks/useResponsive'
import { apiLogger } from '@/lib/logger'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useCallback } from 'react'

// Shared components
import { PageHeader } from '@/components/layout/PageHeader'
import { BreadcrumbPatterns, PageBreadcrumb } from '@/components/ui/page-breadcrumb'
import { Plus, RefreshCw, Users } from 'lucide-react'

// Import components normally - they're lightweight
import CustomerForm from './CustomerForm'
import CustomerSearchFilters from './CustomerSearchFilters'
import CustomersTable from './CustomersTable'
import CustomerStats from './CustomerStats'

import type { CustomersTable as CustomersTableType } from '@/types/database'
import type { Customer } from './types'

const CustomersLayout = () => {
  const router = useRouter()
  const { isMobile } = useResponsive()
  const { formatCurrency } = useSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [currentView, setCurrentView] = useState('list') // 'list', 'add', 'edit'
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [pageSize, setPageSize] = useState(12)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const { setLoading, isLoading } = useLoading({
    [LOADING_KEYS.FETCH_CUSTOMERS]: true
  })

  const [customers, setCustomers] = useState<CustomersTableType[]>([])
  const { toast } = useToast()
  const { confirm } = useConfirm()

  // Fetch customers on mount - auth is handled by middleware
  useEffect(() => {
    void fetchCustomers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch('/api/customers', {
        credentials: 'include', // Include cookies for authentication
      })

      if (response.status === 401) {
        toast({
          title: 'Sesi berakhir',
          description: 'Sesi Anda telah berakhir. Silakan login kembali.',
          variant: 'destructive',
        })
        void router.push('/auth/login')
        return
      }

      if (!response.ok) { throw new Error('Failed to fetch customers') }
      const data = await response.json()
      void setCustomers(data)
    } catch (err: unknown) {
      apiLogger.error({ error: err }, 'Error fetching customers:')
      toast({
        title: 'Terjadi kesalahan',
        description: 'Gagal memuat data pelanggan. Silakan coba lagi.',
        variant: 'destructive',
      })
    } finally {
      void setLoading(LOADING_KEYS.FETCH_CUSTOMERS, false)
    }
  }, [toast, router, setLoading])

  const filteredCustomers = useMemo(() =>
    customers.filter((customer: Customer) =>
      (customer.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ?? false) ||
      (customer.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ?? false) ||
      (customer.phone?.includes(debouncedSearchTerm) ?? false)
    ), [customers, debouncedSearchTerm]
  )

  // Pagination
  const pagination = usePagination({
    initialPageSize: pageSize,
    totalItems: filteredCustomers.length,
  })

  // Get paginated data
  const paginatedCustomers = useMemo(() => filteredCustomers.slice(pagination.startIndex, pagination.endIndex), [filteredCustomers, pagination.startIndex, pagination.endIndex])

  // Update page size
  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize)
    pagination.setPageSize(newSize)
  }, [pagination])

  // Bulk action handlers
  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === filteredCustomers.length) {
      void setSelectedItems([])
    } else {
      setSelectedItems(filteredCustomers.map(customer => customer.id.toString()))
    }
  }, [selectedItems.length, filteredCustomers])

  const handleSelectItem = useCallback((itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }, [])

  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.length === 0) { return }

    const customerNames = filteredCustomers
      .filter(customer => selectedItems.includes(customer.id.toString()))
      .map(customer => customer.name)
      .join(', ')

    const confirmed = await confirm({
      title: `Hapus ${selectedItems.length} Pelanggan?`,
      description: `Anda akan menghapus ${selectedItems.length} pelanggan berikut:\n\n${customerNames}\n\nTindakan ini tidak bisa dibatalkan!`,
      confirmText: 'Hapus',
      variant: 'destructive'
    })

    if (confirmed) {
      try {
        const deletePromises = selectedItems.map(id =>
          fetch(`/api/customers/${id}`, {
            method: 'DELETE',
            credentials: 'include', // Include cookies for authentication
          })
        )
        await Promise.all(deletePromises)
        toast({
          title: 'Berhasil',
          description: `Berhasil menghapus ${selectedItems.length} pelanggan`,
          variant: 'default',
        })
        void setSelectedItems([])
        void fetchCustomers()
      } catch (err: unknown) {
        apiLogger.error({ error: err }, 'Error:')
        toast({
          title: 'Gagal',
          description: 'Gagal menghapus pelanggan',
          variant: 'destructive',
        })
      }
    }
  }, [selectedItems, filteredCustomers, confirm, toast, fetchCustomers])

  const handleBulkEdit = useCallback(() => {
    if (selectedItems.length === 0) { return }

    const selectedCustomers = filteredCustomers.filter(customer => selectedItems.includes(customer.id.toString()))

    // Use the selected customers for bulk edit
    toast({
      title: 'Informasi',
      description: `Bulk edit untuk ${selectedCustomers.length} pelanggan akan segera tersedia`,
      variant: 'default',
    })
   }, [selectedItems, filteredCustomers, toast])

  // Individual action handlers
  const handleEditCustomer = (customer: Customer) => {
    apiLogger.info({ customer }, 'Edit customer')
    setEditingCustomer(customer)
    void setCurrentView('edit')
  }

  const handleDeleteCustomer = async (customer: Customer) => {
    const confirmed = await confirm({
      title: 'Hapus Pelanggan?',
      description: `Yakin ingin menghapus pelanggan "${customer.name}"?\n\nPerhatian: Tindakan ini tidak bisa dibatalkan!`,
      confirmText: 'Hapus',
      variant: 'destructive'
    })

    if (confirmed) {
      try {
        const response = await fetch(`/api/customers/${customer.id}`, {
          method: 'DELETE',
          credentials: 'include', // Include cookies for authentication
        })
        if (!response.ok) { throw new Error('Failed') }
        toast({
          title: 'Berhasil',
          description: 'Pelanggan berhasil dihapus',
          variant: 'default',
        })
        void fetchCustomers()
      } catch (err: unknown) {
        apiLogger.error({ error: err }, 'Error:')
        toast({
          title: 'Gagal',
          description: 'Gagal menghapus pelanggan',
          variant: 'destructive',
        })
      }
    }
  }

  const handleViewCustomer = useCallback((customer: Customer) => {
    void router.push(`/customers/${customer.id}`)
  }, [router])

  const handleFormSuccess = useCallback(() => {
    setCurrentView('list')
    setEditingCustomer(null)
    void fetchCustomers()
  }, [fetchCustomers])

  const handleFormCancel = useCallback(() => {
    setCurrentView('list')
    setEditingCustomer(null)
  }, [])

  // Remove redundant auth loading state - handled by middleware

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <PageBreadcrumb items={BreadcrumbPatterns.customers} />

        {/* Header */}
        <PageHeader
          title="Data Pelanggan"
          description="Kelola database pelanggan dan riwayat pembelian"
          action={
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fetchCustomers()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setCurrentView('add')}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pelanggan
              </Button>
            </div>
          }
        />

        {/* View Switcher */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={currentView === 'list' ? 'default' : 'outline'}
            onClick={() => setCurrentView('list')}
          >
            List View
          </Button>
          <Button
            variant={currentView === 'add' ? 'default' : 'outline'}
            onClick={() => setCurrentView('add')}
          >
            Add Customer
          </Button>
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

        {/* Conditional rendering based on current view */}
        {currentView === 'list' && (
          <>
            {/* Customers Table */}
            {isLoading(LOADING_KEYS.FETCH_CUSTOMERS) ? (
              <CustomersTableSkeleton rows={5} />
            ) : (
              <CustomersTable
                customers={paginatedCustomers}
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
          </>
        )}

        {currentView === 'add' && (
          <CustomerForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}

        {currentView === 'edit' && (
          <CustomerForm
            customer={editingCustomer}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}

        {/* Pagination */}
        {currentView === 'list' && filteredCustomers.length > 0 && (
          <SimplePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalPages={pagination.totalPages}
            totalItems={filteredCustomers.length}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            onPageChange={pagination.setPage}
            onPageSizeChange={handlePageSizeChange}
            canNextPage={pagination.page < pagination.totalPages}
            canPrevPage={pagination.page > 1}
            pageSizeOptions={[12, 24, 48, 96]}
            itemLabel="pelanggan"
          />
        )}

        {/* Info Card */}
        <Card className="bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-gray-100 dark:bg-blue-800/50 p-2 rounded-lg">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  💡 Tips: Manfaatkan Data Pelanggan
                </h3>
                <div className={`text-sm text-gray-800 dark:text-gray-200 ${isMobile ? 'space-y-1' : 'flex items-center gap-4'}`}>
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

export default CustomersLayout
