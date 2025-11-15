// Customers Layout Component - Main Page with Lazy Components
// Main layout component that orchestrates all lazy-loaded customer management components

'use client'

import { Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useSettings } from '@/contexts/settings-context'
import { useToast } from '@/hooks/use-toast'
import { useResponsive } from '@/hooks/useResponsive'
import { createLogger } from '@/lib/logger'

import { CustomerDialog } from './CustomerDialog'
import { CustomerSearchFilters } from './CustomerSearchFilters'
import { CustomerStats } from './CustomerStats'
import { CustomersTable } from './CustomersTable'

import type { Customer } from './types'

const logger = createLogger('CustomersLayout')

export const CustomersLayout = (): JSX.Element => {
  const { toast } = useToast()
  const { isMobile } = useResponsive()
  const { formatCurrency } = useSettings()

  // State
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; customer: Customer | null; bulk: boolean }>({
    show: false,
    customer: null,
    bulk: false
  })

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/customers')
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }

      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      logger.error({ error }, 'Failed to fetch customers')
      toast({
        title: 'Error',
        description: 'Gagal memuat data pelanggan',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Load customers on mount
  useEffect(() => {
    void fetchCustomers()
  }, [fetchCustomers])

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

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm.customer) return

    try {
      const customer = deleteConfirm.customer
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete customer')
      }

      toast({
        title: 'Berhasil',
        description: 'Pelanggan berhasil dihapus'
      })

      fetchCustomers()
      setDeleteConfirm({ show: false, customer: null, bulk: false })
    } catch (error) {
      logger.error({ error }, 'Failed to delete customer')
      toast({
        title: 'Error',
        description: 'Gagal menghapus pelanggan',
        variant: 'destructive'
      })
    }
  }, [toast, fetchCustomers, deleteConfirm.customer])

  const handleBulkDelete = useCallback(async () => {
    setDeleteConfirm({ show: true, customer: null, bulk: true })
  }, [])

  const confirmBulkDelete = useCallback(async () => {
    try {
      await Promise.all(
        selectedItems.map(id =>
          fetch(`/api/customers/${id}`, { method: 'DELETE' })
        )
      )

      toast({
        title: 'Berhasil',
        description: `${selectedItems.length} pelanggan berhasil dihapus`
      })

      setSelectedItems([])
      fetchCustomers()
      setDeleteConfirm({ show: false, customer: null, bulk: false })
    } catch (error) {
      logger.error({ error }, 'Failed to delete customers')
      toast({
        title: 'Error',
        description: 'Gagal menghapus pelanggan',
        variant: 'destructive'
      })
    }
  }, [selectedItems, toast, fetchCustomers])

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
    fetchCustomers()
  }, [fetchCustomers])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Pelanggan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola data pelanggan Anda
          </p>
        </div>
        <Button onClick={handleAddNew} size={isMobile ? 'default' : 'default'}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pelanggan
        </Button>
      </div>

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