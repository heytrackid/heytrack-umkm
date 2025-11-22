// Customers Layout Component - Main Page with Lazy Components
// Main layout component that orchestrates all lazy-loaded customer management components

'use client'

import { Plus, Upload } from '@/components/icons'
import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCustomers, useDeleteCustomer, useImportCustomers } from '@/hooks/useCustomers'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { ImportDialog } from '@/components/import/ImportDialog'
import { generateCustomersTemplate, parseCustomersCSV } from '@/components/import/csv-helpers'
import { useSettings } from '@/contexts/settings-context'
import { toast } from 'sonner'
import { useResponsive } from '@/hooks/useResponsive'
import { handleError } from '@/lib/error-handling'


import { CustomerDialog } from './CustomerDialog'
import { CustomerSearchFilters } from './CustomerSearchFilters'
import { CustomerStats } from './CustomerStats'
import { CustomersTable } from './CustomersTable'
import { ServerPagination } from '@/components/ui/server-pagination'

import type { Customer } from './types'



export const CustomersLayout = (): JSX.Element => {
   const { isMobile } = useResponsive()
   const { formatCurrency } = useSettings()
   const queryClient = useQueryClient()

   // State
   const [searchTerm, setSearchTerm] = useState('')
   const [selectedItems, setSelectedItems] = useState<string[]>([])
   const [dialogOpen, setDialogOpen] = useState(false)
   const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
   const [importDialogOpen, setImportDialogOpen] = useState(false)
   const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; customer: Customer | null; bulk: boolean }>({
     show: false,
     customer: null,
     bulk: false
   })

   // Pagination state
   const [page, setPage] = useState(1)
   const [limit, setLimit] = useState(20)

   // Fetch customers with pagination
   const { data: customersResponse, isLoading } = useCustomers({
     page,
     limit,
     search: searchTerm.trim() || undefined
   })

    // Extract data and pagination from response
    const customers = useMemo(() => customersResponse?.data || [], [customersResponse?.data])
    const pagination = customersResponse?.pagination

  // Mutations
  const deleteCustomerMutation = useDeleteCustomer()
  const importCustomersMutation = useImportCustomers()
  const bulkDeleteMutation = useMutation({
    mutationFn: async (customerIds: string[]) => {
      await Promise.all(
        customerIds.map(id =>
          fetch(`/api/customers/${id}`, { method: 'DELETE' })
        )
      )
    },
    onSuccess: (_, customerIds) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success(`${customerIds.length} pelanggan berhasil dihapus`)
      setSelectedItems([])
    },
    onError: (error) => handleError(error, 'Delete customers', true, 'Gagal menghapus pelanggan')
  })

   // Handle pagination changes
   const handlePageChange = useCallback((newPage: number) => {
     setPage(newPage)
   }, [])

   const handlePageSizeChange = useCallback((newLimit: number) => {
     setLimit(newLimit)
     setPage(1) // Reset to first page when changing page size
   }, [])

   // Handle search with debouncing
   const handleSearchChange = useCallback((newSearch: string) => {
     setSearchTerm(newSearch)
     setPage(1) // Reset to first page when searching
   }, [])

  // Handlers
  const handleAddNew = useCallback(() => {
    setEditingCustomer(null)
    setDialogOpen(true)
  }, [])

  const handleEdit = useCallback((customer: Customer) => {
    setEditingCustomer(customer)
    setDialogOpen(true)
  }, [])

  const handleDelete = useCallback(async (customer: Customer) => {
    setDeleteConfirm({ show: true, customer, bulk: false })
  }, [])

  const confirmDelete = useCallback(() => {
    if (!deleteConfirm.customer) return

    deleteCustomerMutation.mutate(deleteConfirm.customer.id, {
      onSuccess: () => {
        setDeleteConfirm({ show: false, customer: null, bulk: false })
      }
    })
  }, [deleteConfirm.customer, deleteCustomerMutation])

  const handleBulkDelete = useCallback(async () => {
    setDeleteConfirm({ show: true, customer: null, bulk: true })
  }, [])

  const confirmBulkDelete = useCallback(() => {
    bulkDeleteMutation.mutate(selectedItems, {
      onSuccess: () => {
        setDeleteConfirm({ show: false, customer: null, bulk: false })
      }
    })
  }, [selectedItems, bulkDeleteMutation])

  const handleSelectItem = useCallback((itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedItems(prev =>
      prev.length === customers.length
        ? []
        : customers.map(c => c.id.toString())
    )
  }, [customers])

  const handleDialogSuccess = useCallback(() => {
    setDialogOpen(false)
    setEditingCustomer(null)
    queryClient.invalidateQueries({ queryKey: ['customers'] })
  }, [queryClient])

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Pelanggan"
        description="Kelola data pelanggan Anda"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(true)}
              className="flex-1 sm:flex-none"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pelanggan
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <CustomerStats
        customers={customers}
        isLoading={isLoading}
        isMobile={isMobile}
      />

       {/* Search & Filters */}
       <CustomerSearchFilters
         searchTerm={searchTerm}
         onSearchChange={handleSearchChange}
         filteredCustomers={customers}
         selectedItems={selectedItems}
         onClearSelection={() => setSelectedItems([])}
         onBulkDelete={handleBulkDelete}
         isLoading={isLoading}
       />

       {/* Table */}
        <CustomersTable
          customers={customers}
          selectedItems={selectedItems}
          onSelectItem={handleSelectItem}
          onSelectAll={handleSelectAll}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={handleAddNew}
          formatCurrency={formatCurrency}
          isMobile={isMobile}
          isLoading={isLoading}
        />

       {/* Pagination */}
       {pagination && (
         <ServerPagination
           pagination={pagination}
           onPageChange={handlePageChange}
           onPageSizeChange={handlePageSizeChange}
           pageSizeOptions={[10, 20, 50, 100]}
         />
       )}

      {/* Dialog */}
      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editingCustomer}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">
              {deleteConfirm.bulk ? 'Hapus Pelanggan?' : `Hapus ${deleteConfirm.customer?.name}?`}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {deleteConfirm.bulk
                ? `Yakin ingin menghapus ${selectedItems.length} pelanggan? Tindakan ini tidak dapat dibatalkan.`
                : 'Yakin ingin menghapus pelanggan ini? Tindakan ini tidak dapat dibatalkan.'
              }
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm({ show: false, customer: null, bulk: false })}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={deleteConfirm.bulk ? confirmBulkDelete : confirmDelete}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        title="Import Pelanggan"
        description="Upload file CSV untuk import data pelanggan secara massal"
        templateUrl={`data:text/csv;charset=utf-8,${encodeURIComponent(generateCustomersTemplate())}`}
        templateFilename="template-pelanggan.csv"
        parseCSV={parseCustomersCSV}
        onImport={async (data) => {
          try {
            await importCustomersMutation.mutateAsync(data)
            return {
              success: true,
              count: data.length
            }
          } catch (error: unknown) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Terjadi kesalahan saat import'
            }
          }
        }}
      />
    </div>
  )
}