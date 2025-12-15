'use client'

import { MessageSquare, Upload } from '@/components/icons'
import { useCallback, useState } from 'react'

import { generateSuppliersTemplate, parseSuppliersCSV } from '@/components/import/csv-helpers'
import { ImportDialog } from '@/components/import/ImportDialog'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { SharedDataTable } from '@/components/shared/SharedDataTable'
import { Button } from '@/components/ui/button'
import { BreadcrumbPatterns, DeleteModal, PageBreadcrumb, StatCardPatterns, StatsCards } from '@/components/ui/index'
import { errorToast, successToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/useCurrency'
import {
    useBulkDeleteSuppliers,
    useCreateSupplier,
    useDeleteSupplier,
    useImportSuppliers,
    useSuppliers,
    useUpdateSupplier
} from '@/hooks/useSuppliers'

import { SupplierEditDialog } from '@/app/suppliers/components/SupplierEditDialog'
import { SupplierFollowup } from '@/app/suppliers/components/SupplierFollowup'
import { SupplierForm } from '@/app/suppliers/components/SupplierForm'
import type { Supplier } from './components/types'

const SuppliersPage = (): JSX.Element => {
    const { formatCurrency } = useCurrency()
    const { data: suppliersData, refetch, isLoading } = useSuppliers()
    const suppliers = suppliersData as Supplier[] | undefined
    const [importDialogOpen, setImportDialogOpen] = useState(false)
    const importSuppliersMutation = useImportSuppliers()
    const createSupplierMutation = useCreateSupplier()
    const deleteSupplierMutation = useDeleteSupplier()
    const bulkDeleteMutation = useBulkDeleteSuppliers()
    const updateSupplierMutation = useUpdateSupplier()

    // Delete confirmation state
    const [deleteConfirm, setDeleteConfirm] = useState<{
        show: boolean
        supplier: Supplier | null
        bulk: boolean
        suppliers: Supplier[]
    }>({ show: false, supplier: null, bulk: false, suppliers: [] })

    // Edit dialog state
    const [editDialog, setEditDialog] = useState<{
        open: boolean
        supplier: Supplier | null
    }>({ open: false, supplier: null })

    // Followup dialog state
    const [followupDialog, setFollowupDialog] = useState<{
        open: boolean
        supplier: Supplier | null
    }>({ open: false, supplier: null })

    // Calculate stats
    const totalSuppliers = suppliers?.length ?? 0
    const activeSuppliers = suppliers?.filter((s) => s.is_active).length ?? 0
    const preferredSuppliers = suppliers?.filter((s) => s.supplier_type === 'preferred').length ?? 0
    const totalSpent = suppliers?.reduce((sum: number, s) =>
        sum + (Number(s.total_spent) || 0), 0
    ) ?? 0

    // Table columns
    const columns = [
        {
            key: 'name' as const,
            header: 'Nama',
            sortable: true,
            render: (value: unknown) => (
                <span className="font-medium">{String(value)}</span>
            )
        },
        {
            key: 'contact_person' as const,
            header: 'Kontak',
            render: (value: unknown) => String(value || '-')
        },
        {
            key: 'email' as const,
            header: 'Email',
            hideOnMobile: true,
            render: (value: unknown) => String(value || '-')
        },
        {
            key: 'supplier_type' as const,
            header: 'Tipe',
            filterable: true,
            filterType: 'select' as const,
            filterOptions: [
                { label: 'Preferred', value: 'preferred' },
                { label: 'Standard', value: 'standard' },
                { label: 'Trial', value: 'trial' },
                { label: 'Blacklisted', value: 'blacklisted' },
            ],
            render: (value: unknown) => {
                const type = String(value || 'standard')
                const styles: Record<string, string> = {
                    preferred: 'bg-blue-100 text-blue-800',
                    standard: 'bg-green-100 text-green-800',
                    trial: 'bg-yellow-100 text-yellow-800',
                    blacklisted: 'bg-red-100 text-red-800',
                }
                const labels: Record<string, string> = {
                    preferred: 'Preferred',
                    standard: 'Standard',
                    trial: 'Trial',
                    blacklisted: 'Blacklisted',
                }
                return (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[type] || 'bg-green-100 text-green-800'}`}>
                        {labels[type] || 'Standard'}
                    </span>
                )
            }
        },
        {
            key: 'is_active' as const,
            header: 'Status',
            filterable: true,
            filterType: 'select' as const,
            filterOptions: [
                { label: 'Aktif', value: 'true' },
                { label: 'Tidak Aktif', value: 'false' },
            ],
            render: (value: unknown) => (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                    {value ? 'Aktif' : 'Tidak Aktif'}
                </span>
            )
        },
        {
            key: 'rating' as const,
            header: 'Rating',
            hideOnMobile: true,
            render: (value: unknown) => value ? `${value}/5` : '-'
        },
    ]

    // Handlers
    const handleDelete = useCallback((supplier: Supplier) => {
        setDeleteConfirm({ show: true, supplier, bulk: false, suppliers: [] })
    }, [])

    const handleBulkDelete = useCallback((suppliersToDelete: Supplier[]) => {
        setDeleteConfirm({ show: true, supplier: null, bulk: true, suppliers: suppliersToDelete })
    }, [])

    const confirmDelete = useCallback(async () => {
        try {
            if (deleteConfirm.bulk && deleteConfirm.suppliers.length > 0) {
                const ids = deleteConfirm.suppliers.map(s => s.id)
                await bulkDeleteMutation.mutateAsync(ids)
                successToast("Berhasil", `${deleteConfirm.suppliers.length} supplier berhasil dihapus`)
            } else if (deleteConfirm.supplier) {
                await deleteSupplierMutation.mutateAsync(deleteConfirm.supplier.id)
                successToast('Berhasil', 'Supplier berhasil dihapus')
            }
        } catch (error) {
            errorToast('Error', error instanceof Error ? error.message : 'Gagal menghapus supplier')
        } finally {
            setDeleteConfirm({ show: false, supplier: null, bulk: false, suppliers: [] })
        }
    }, [deleteConfirm, bulkDeleteMutation, deleteSupplierMutation])

    const handleEdit = useCallback((supplier: Supplier) => {
        setEditDialog({ open: true, supplier })
    }, [])

    const handleFollowup = useCallback((supplier: Supplier) => {
        setFollowupDialog({ open: true, supplier })
    }, [])

    // Custom actions for table
    const customActions = [
        {
            label: 'Follow Up',
            icon: MessageSquare,
            onClick: handleFollowup,
            variant: 'default' as const,
            show: (supplier: Supplier) => Boolean(supplier.is_active && (supplier.phone || supplier.email))
        }
    ]

    const handleEditSubmit = useCallback(async (data: Partial<Supplier>) => {
        if (!editDialog.supplier) return
        
        await updateSupplierMutation.mutateAsync({
            id: editDialog.supplier.id,
            data
        })
        successToast('Berhasil', 'Supplier berhasil diupdate')
        setEditDialog({ open: false, supplier: null })
    }, [editDialog.supplier, updateSupplierMutation])

    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                <PageBreadcrumb items={BreadcrumbPatterns.suppliers} />

                {/* Header */}
                <PageHeader
                    title="Supplier"
                    description="Kelola data supplier dan vendor bahan baku"
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
                             <SupplierForm
                                 onSubmit={async (data) => {
                                     await createSupplierMutation.mutateAsync({
                                         ...data,
                                         contact_person: data.contact_person || null,
                                         phone: data.phone || null,
                                         email: data.email || null,
                                         address: data.address || null,
                                         notes: data.notes || null,
                                     })
                                 }}
                             />
                        </div>
                    }
                />

                {/* Stats Cards */}
                <StatsCards stats={StatCardPatterns.suppliers({
                    total: totalSuppliers,
                    active: activeSuppliers,
                    preferred: preferredSuppliers,
                    totalSpent,
                    formatCurrency
                })} />

                {/* Data Table */}
                <SharedDataTable
                    data={suppliers || []}
                    columns={columns}
                    customActions={customActions}
                    title="Daftar Supplier"
                    searchPlaceholder="Cari supplier..."
                    emptyMessage="Belum ada data supplier"
                    emptyDescription="Tambahkan supplier baru untuk memulai"
                    loading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onBulkDelete={handleBulkDelete}
                    onRefresh={() => refetch()}
                    enableBulkActions={true}
                    enablePagination={true}
                    pageSizeOptions={[10, 25, 50, 100]}

                    exportable={true}
                    refreshable={true}
                />

                {/* Delete Confirmation Dialog */}
                <DeleteModal
                    isOpen={deleteConfirm.show}
                    onClose={() => setDeleteConfirm({ show: false, supplier: null, bulk: false, suppliers: [] })}
                    onConfirm={confirmDelete}
                    entityName={deleteConfirm.bulk ? `${deleteConfirm.suppliers.length} Supplier` : 'Supplier'}
                    itemName={deleteConfirm.bulk ? `${deleteConfirm.suppliers.length} supplier terpilih` : deleteConfirm.supplier?.name ?? ''}
                    isLoading={deleteSupplierMutation.isPending || bulkDeleteMutation.isPending}
                />

                {/* Edit Dialog */}
                <SupplierEditDialog
                    open={editDialog.open}
                    supplier={editDialog.supplier}
                    onOpenChange={(open) => !open && setEditDialog({ open: false, supplier: null })}
                    onSubmit={handleEditSubmit}
                    isLoading={updateSupplierMutation.isPending}
                />

                {/* Followup Dialog */}
                <SupplierFollowup
                    supplier={followupDialog.supplier}
                    open={followupDialog.open}
                    onOpenChange={(open) => !open && setFollowupDialog({ open: false, supplier: null })}
                />

                {/* Import Dialog */}
                <ImportDialog
                    open={importDialogOpen}
                    onOpenChange={setImportDialogOpen}
                    title="Import Supplier"
                    description="Upload file CSV untuk import data supplier secara massal"
                    templateUrl={`data:text/csv;charset=utf-8,${encodeURIComponent(generateSuppliersTemplate())}`}
                    templateFilename="template-supplier.csv"
                    parseCSV={parseSuppliersCSV}
                    onImport={async (data) => {
                        try {
                            await importSuppliersMutation.mutateAsync(data)
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
        </AppLayout>
    )
}

export default SuppliersPage
