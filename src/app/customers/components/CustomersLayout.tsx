'use client'

import { Eye, Mail, Phone, Plus, Upload } from '@/components/icons'
import { useCustomers, useDeleteCustomer, useImportCustomers } from '@/hooks/useCustomers'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'

import { ImportDialog } from '@/components/import/ImportDialog'
import { generateCustomersTemplate, parseCustomersCSV } from '@/components/import/csv-helpers'
import { PageHeader } from '@/components/layout/PageHeader'
import { SharedDataTable, type Column, type ServerPaginationMeta } from '@/components/shared/SharedDataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteModal } from '@/components/ui/index'
import { useSettings } from '@/contexts/settings-context'
import { successToast } from '@/hooks/use-toast'
import { handleError } from '@/lib/error-handling'

import { CustomerDialog } from './CustomerDialog'
import { CustomerStats } from './CustomerStats'
import type { Customer } from './types'

export const CustomersLayout = (): JSX.Element => {
  const router = useRouter()
  const { formatCurrency } = useSettings()
  const queryClient = useQueryClient()

  // State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; customer: Customer | null }>({ show: false, customer: null })

  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch customers with pagination
  const { data: customersResponse, isLoading, refetch } = useCustomers({
    page,
    limit,
    search: searchTerm.trim() || undefined
  })

  const customers = useMemo(() => customersResponse?.data || [], [customersResponse?.data])
  const pagination = customersResponse?.pagination

  // Server pagination meta for SharedDataTable
  const serverPagination: ServerPaginationMeta | undefined = pagination ? {
    total: pagination.total,
    page: pagination.page,
    limit: pagination.limit,
    pages: pagination.pages,
    hasNext: pagination.hasNext,
    hasPrev: pagination.hasPrev,
  } : undefined

  // Mutations
  const deleteCustomerMutation = useDeleteCustomer()
  const importCustomersMutation = useImportCustomers()
  const bulkDeleteMutation = useMutation({
    mutationFn: async (customerIds: string[]) => {
      const { deleteApi } = await import('@/lib/query/query-helpers')
      await Promise.all(customerIds.map(id => deleteApi(`/api/customers/${id}`)))
    },
    onSuccess: (_, customerIds) => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
      successToast("Berhasil", `${customerIds.length} pelanggan berhasil dihapus`)
    },
    onError: (error) => handleError(error, 'Delete customers', true, 'Gagal menghapus pelanggan')
  })

  // Handlers
  const handleAddNew = useCallback(() => {
    setEditingCustomer(null)
    setDialogOpen(true)
  }, [])

  const handleView = useCallback((customer: Customer) => {
    router.push(`/customers/${customer.id}`)
  }, [router])

  const handleEdit = useCallback((customer: Customer) => {
    setEditingCustomer(customer)
    setDialogOpen(true)
  }, [])

  const handleDelete = useCallback((customer: Customer) => {
    setDeleteConfirm({ show: true, customer })
  }, [])

  const confirmDelete = useCallback(() => {
    if (!deleteConfirm.customer) return
    deleteCustomerMutation.mutate(deleteConfirm.customer.id, {
      onSuccess: () => setDeleteConfirm({ show: false, customer: null })
    })
  }, [deleteConfirm.customer, deleteCustomerMutation])

  const handleBulkDelete = useCallback((items: Customer[]) => {
    bulkDeleteMutation.mutate(items.map(c => c.id.toString()))
  }, [bulkDeleteMutation])

  const handleDialogSuccess = useCallback(() => {
    setDialogOpen(false)
    setEditingCustomer(null)
    void queryClient.invalidateQueries({ queryKey: ['customers'] })
  }, [queryClient])

  // Column definitions
  const columns: Array<Column<Customer>> = useMemo(() => [
    {
      key: 'name',
      header: 'Nama',
      render: (_, customer) => (
        <div className="flex flex-col">
          <span className="font-semibold">{customer.name}</span>
          <Badge variant={customer.is_active ? "default" : "secondary"} className="w-fit mt-1 text-xs">
            {customer.is_active ? 'Aktif' : 'Tidak Aktif'}
          </Badge>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Kontak',
      render: (_, customer) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{customer.email || '-'}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span>{customer.phone || '-'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'total_spent',
      header: 'Total Belanja',
      render: (_, customer) => (
        <span className="font-medium text-muted-foreground">
          {formatCurrency(customer.total_spent ?? 0)}
        </span>
      )
    },
    {
      key: 'total_orders',
      header: 'Total Order',
      render: (_, customer) => (
        <span className="font-medium">{customer.total_orders ?? 0}</span>
      )
    },
    {
      key: 'last_order_date',
      header: 'Order Terakhir',
      render: (_, customer) => (
        <span className="text-sm text-muted-foreground">
          {customer.last_order_date || '-'}
        </span>
      )
    }
  ], [formatCurrency])

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Pelanggan"
        description="Kelola data pelanggan Anda"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="flex-1 sm:flex-none">
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

      <CustomerStats customers={customers} isLoading={isLoading} isMobile={false} />

      <SharedDataTable
        data={customers}
        columns={columns}
        loading={isLoading}
        serverPagination={serverPagination}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setLimit(size); setPage(1) }}
        onSearchChange={(search) => { setSearchTerm(search); setPage(1) }}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onRefresh={() => void refetch()}
        onAdd={handleAddNew}
        enableBulkActions
        addButtonText="Tambah Pelanggan"
        searchPlaceholder="Cari pelanggan..."
        emptyMessage="Belum Ada Customer"
        emptyDescription="Tambahkan data customer untuk tracking order dan analisis penjualan."
        pageSizeOptions={[10, 20, 50, 100]}
        customActions={[
          {
            label: 'Lihat Detail',
            icon: Eye,
            onClick: handleView
          }
        ]}
      />

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editingCustomer}
        onSuccess={handleDialogSuccess}
      />

      <DeleteModal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, customer: null })}
        onConfirm={confirmDelete}
        entityName="Pelanggan"
        itemName={deleteConfirm.customer?.name ?? ''}
      />

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
            return { success: true, count: data.length }
          } catch (error: unknown) {
            return { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan saat import' }
          }
        }}
      />
    </div>
  )
}
