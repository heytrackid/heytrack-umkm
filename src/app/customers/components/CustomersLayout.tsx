// Customers Layout Component - Main Page with Lazy Components
// Main layout component that orchestrates all lazy-loaded customer management components

'use client'

import { Plus, RefreshCw, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useCallback } from 'react'

import AppLayout from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { BreadcrumbPatterns, PageBreadcrumb } from '@/components/ui/page-breadcrumb'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { CustomersTableSkeleton } from '@/components/ui/skeletons/table-skeletons'
import { useSettings } from '@/contexts/settings-context'
import { LOADING_KEYS, useLoading } from '@/hooks/loading'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagination } from '@/hooks/usePagination'
import { useResponsive } from '@/hooks/useResponsive'
import { apiLogger } from '@/lib/logger'

// Shared components


// Import components normally - they're lightweight
import { CustomerDialog } from './CustomerDialog'
import CustomerSearchFilters from './CustomerSearchFilters'
import CustomersTable from './CustomersTable'
import CustomerStats from './CustomerStats'

import type { Customer } from './types'

const CustomersLayout = (): JSX.Element => {
  const router = useRouter()
  const { isMobile } = useResponsive()
  const { formatCurrency } = useSettings()
   const [searchTerm, setSearchTerm] = useState('')
   const debouncedSearchTerm = useDebounce(searchTerm, 300)
   const [selectedItems, setSelectedItems] = useState<string[]>([])
   const [pageSize, setPageSize] = useState(12)
   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
   const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const { setLoading, isLoading } = useLoading({
    [LOADING_KEYS.FETCH_CUSTOMERS]: true
  })

  const [customers, setCustomers] = useState<Customer[]>([])
  const { toast } = useToast()
  const { confirm } = useConfirm()

  // Fetch customers on mount - auth is handled by middleware
    // This is intentional - fetch customers on mount only
    useEffect(() => {
      fetchCustomers()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch('/api/customers', {
        credentials: 'include', // Include cookies for authentication
      })

      if (response['status'] === 401) {
        toast({
          title: 'Sesi berakhir',
          description: 'Sesi Anda telah berakhir. Silakan login kembali.',
          variant: 'destructive',
        })
        router.push('/auth/login')
        return
      }

      if (!response.ok) { throw new Error('Failed to fetch customers') }
      const data = await response.json() as Customer[]
      setCustomers(data)
    } catch (error) {
      apiLogger.error({ error }, 'Error fetching customers:')
      toast({
        title: 'Terjadi kesalahan',
        description: 'Gagal memuat data pelanggan. Silakan coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setLoading(LOADING_KEYS.FETCH_CUSTOMERS, false)
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
      setSelectedItems([])
    } else {
      setSelectedItems(filteredCustomers.map(customer => customer['id'].toString()))
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
      .filter(customer => selectedItems.includes(customer['id'].toString()))
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

        const results = await Promise.allSettled(deletePromises)
        const failedDeletes = results.filter(result => result.status === 'rejected').length
        const successfulDeletes = selectedItems.length - failedDeletes

        if (failedDeletes > 0) {
          // Check if any failed due to existing orders
          const responses = await Promise.allSettled(
            selectedItems.map(id =>
              fetch(`/api/customers/${id}`, {
                method: 'DELETE',
                credentials: 'include',
              }).then(res => res.json().catch(() => ({})))
            )
          )

          const orderErrors = responses
            .filter(result => result.status === 'fulfilled' && result.value.error?.includes('existing orders'))
            .length

          if (orderErrors > 0) {
            toast({
              title: 'Beberapa Pelanggan Tidak Dapat Dihapus',
              description: `${successfulDeletes} pelanggan berhasil dihapus. ${failedDeletes} pelanggan memiliki order aktif dan tidak dapat dihapus.`,
              variant: 'destructive',
            })
          } else {
            toast({
              title: 'Gagal Menghapus Beberapa Pelanggan',
              description: `${successfulDeletes} pelanggan berhasil dihapus. ${failedDeletes} pelanggan gagal dihapus.`,
              variant: 'destructive',
            })
          }
        } else {
          toast({
            title: 'Berhasil',
            description: `Berhasil menghapus ${selectedItems.length} pelanggan`,
            variant: 'default',
          })
        }

        setSelectedItems([])
        void fetchCustomers()
      } catch (error) {
        apiLogger.error({ error }, 'Error in bulk delete:')
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

    const selectedCustomers = filteredCustomers.filter(customer => selectedItems.includes(customer['id'].toString()))

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
        const response = await fetch(`/api/customers/${customer['id']}`, {
          method: 'DELETE',
          credentials: 'include', // Include cookies for authentication
        })

        if (!response.ok) {
          // Try to get specific error message from API
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || 'Gagal menghapus pelanggan'
          throw new Error(errorMessage)
        }

        toast({
          title: 'Berhasil',
          description: 'Pelanggan berhasil dihapus',
          variant: 'default',
        })
        void fetchCustomers()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus pelanggan'
        apiLogger.error({ error }, 'Error deleting customer:')
        toast({
          title: 'Gagal',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    }
  }

  const handleViewCustomer = useCallback((customer: Customer) => {
    router.push(`/customers/${customer['id']}`)
  }, [router])

   const handleFormSuccess = useCallback(() => {
     setIsAddDialogOpen(false)
     setEditingCustomer(null)
     void fetchCustomers()
   }, [fetchCustomers])

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
               <Button onClick={() => setIsAddDialogOpen(true)}>
                 <Plus className="h-4 w-4 mr-2" />
                 Tambah Pelanggan
               </Button>
            </div>
          }
        />



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
             customers={paginatedCustomers}
             selectedItems={selectedItems}
             onSelectItem={handleSelectItem}
             onSelectAll={handleSelectAll}
             onView={handleViewCustomer}
             onEdit={handleEditCustomer}
             onDelete={handleDeleteCustomer}
             onAddNew={() => setIsAddDialogOpen(true)}
             formatCurrency={formatCurrency}
             isMobile={isMobile}
           />
         )}

         {/* Pagination */}
         {filteredCustomers.length > 0 && (
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

        {/* Customer Dialogs */}
        <CustomerDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSuccess={handleFormSuccess}
        />

        <CustomerDialog
          open={Boolean(editingCustomer)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingCustomer(null)
            }
          }}
          customer={editingCustomer}
          onSuccess={handleFormSuccess}
        />
      </div>
    </AppLayout>
  )
}

export default CustomersLayout
