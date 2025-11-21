// Customers Layout Component - Main Page with Lazy Components
// Main layout component that orchestrates all lazy-loaded customer management components

'use client'

import { Plus } from '@/components/icons'
import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCustomers } from '@/hooks/useCustomers'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { useSettings } from '@/contexts/settings-context'
import { toast } from '@/lib/toast'
import { useResponsive } from '@/hooks/useResponsive'
import { createLogger } from '@/lib/logger'

import { CustomerDialog } from './CustomerDialog'
import { CustomerSearchFilters } from './CustomerSearchFilters'
import { CustomerStats } from './CustomerStats'
import { CustomersTable } from './CustomersTable'

import type { Customer } from './types'

const logger = createLogger('CustomersLayout')

export const CustomersLayout = (): JSX.Element => {
  const { isMobile } = useResponsive()
  const { formatCurrency } = useSettings()
  const queryClient = useQueryClient()

  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; customer: Customer | null; bulk: boolean }>({
    show: false,
    customer: null,
    bulk: false
   })

  // Fetch customers with standardized hook
  const { data, isLoading } = useCustomers()
  const customers = useMemo(() => data || [], [data])

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete customer')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Pelanggan berhasil dihapus')
    },
    onError: () => {
      toast.error('Gagal menghapus pelanggan')
    }
  })

  // Bulk delete mutation
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
    onError: () => {
      toast.error('Gagal menghapus pelanggan')
    }
  })

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers

    const term = searchTerm.toLowerCase()
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(term) ||
      customer.email?.toLowerCase().includes(term) ||
      customer.phone?.toLowerCase().includes(term)
    )
  }, [customers, searchTerm])

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

    deleteMutation.mutate(deleteConfirm.customer.id, {
      onSuccess: () => {
        setDeleteConfirm({ show: false, customer: null, bulk: false })
      }
    })
  }, [deleteConfirm.customer, deleteMutation])

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
        action={
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pelanggan
          </Button>
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
        onSearchChange={setSearchTerm}
        filteredCustomers={filteredCustomers}
        selectedItems={selectedItems}
        onClearSelection={() => setSelectedItems([])}
        onBulkDelete={handleBulkDelete}
        isLoading={isLoading}
      />

      {/* Table */}
      <CustomersTable
        customers={filteredCustomers}
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
    </div>
  )
}