'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'

import { SupplierFormFields } from '@/components/forms/shared/SupplierFormFields'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DeleteModal } from '@/components/ui/index'
import { LoadingButton } from '@/components/ui/loading-button'
import { SimpleDataTable, type SimpleColumn } from '@/components/ui/simple-data-table'
import { useSupabaseCRUD } from '@/hooks/supabase/index'
import { createClientLogger } from '@/lib/client-logger'
import { SupplierFormSchema, type SupplierForm } from '@/lib/validations/form-validations'

const logger = createClientLogger('SuppliersCRUD')
import type { Row, Insert, Update } from '@/types/database'

type Supplier = Row<'suppliers'>

const getEmptySupplierForm = (): SupplierForm => ({
  name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
})

export const SuppliersCRUD = (): JSX.Element => {
  const { data: suppliers, loading, error, create: createSupplier, update: updateSupplier, remove: deleteSupplier } = useSupabaseCRUD('suppliers')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

  const createForm = useForm<SupplierForm>({
    resolver: zodResolver(SupplierFormSchema),
    defaultValues: getEmptySupplierForm()
  })

  // Reset create form when modal opens
  useEffect(() => {
    if (isCreateModalOpen) {
      createForm.reset(getEmptySupplierForm())
    }
  }, [isCreateModalOpen, createForm])

  const editForm = useForm<SupplierForm>({
    resolver: zodResolver(SupplierFormSchema),
    defaultValues: getEmptySupplierForm()
  })

  const columns: Array<SimpleColumn<Supplier>> = [
    {
      key: 'name',
      header: 'Nama Supplier',
    },
    {
      key: 'contact_person',
      header: 'Contact Person',
      accessor: (supplier) => supplier.contact_person,
      render: (value) => (value as string | null) ?? '-',
    },
    {
      key: 'phone',
      header: 'Telepon',
      accessor: (supplier) => supplier.phone,
      render: (value) => (value as string | null) ?? '-',
      hideOnMobile: true,
    },
    {
      key: 'email',
      header: 'Email',
      accessor: (supplier) => supplier.email,
      render: (value) => (value as string | null) ?? '-',
      hideOnMobile: true,
    },
  ]

  const handleCreate = useCallback((): void => {
    setIsCreateModalOpen(true)
  }, [])

  const handleEdit = useCallback((supplier: Supplier): void => {
    setSelectedSupplier(supplier)
    editForm.reset({
      name: supplier.name,
      contact_person: supplier.contact_person ?? '',
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      address: supplier.address ?? '',
      notes: supplier.notes ?? '',
    })
    setIsEditModalOpen(true)
  }, [editForm])

  const handleDelete = useCallback((supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleSubmitCreate = useCallback(async (data: SupplierForm): Promise<void> => {
    try {
      await createSupplier(data as Insert<'suppliers'>)
      setIsCreateModalOpen(false)
      createForm.reset(getEmptySupplierForm())
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to create supplier')
    }
  }, [createSupplier, createForm])

  const handleSubmitEdit = useCallback(async (data: SupplierForm) => {
    if (!selectedSupplier) return

    try {
      await updateSupplier(selectedSupplier.id, data as Update<'suppliers'>)
      setIsEditModalOpen(false)
      setSelectedSupplier(null)
      editForm.reset(getEmptySupplierForm())
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to update supplier')
    }
  }, [selectedSupplier, updateSupplier, editForm])

  const handleConfirmDelete = useCallback(async (): Promise<void> => {
    if (!selectedSupplier) return

    try {
      await deleteSupplier(selectedSupplier.id)
      setIsDeleteDialogOpen(false)
      setSelectedSupplier(null)
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to delete supplier')
    }
  }, [selectedSupplier, deleteSupplier])

  const handleCreateDialogChange = useCallback((open: boolean) => {
    setIsCreateModalOpen(open)
    if (!open) {
      createForm.reset(getEmptySupplierForm())
    }
  }, [createForm])

  const handleEditDialogChange = useCallback((open: boolean) => {
    setIsEditModalOpen(open)
    if (!open) {
      setSelectedSupplier(null)
      editForm.reset(getEmptySupplierForm())
    }
  }, [editForm])

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error memuat supplier: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SimpleDataTable
        data={suppliers || []}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleCreate}
        title="Supplier"
        addButtonText="Tambah Supplier"
        emptyMessage="Belum ada supplier. Tambah supplier pertama Anda untuk memulai."
      />

      <SupplierDialog
        open={isCreateModalOpen}
        onOpenChange={handleCreateDialogChange}
        title="Tambah Supplier Baru"
        submitLabel="Tambah Supplier"
        form={createForm}
        onSubmit={handleSubmitCreate}
      />

      <SupplierDialog
        open={isEditModalOpen}
        onOpenChange={handleEditDialogChange}
        title={selectedSupplier ? `Edit ${selectedSupplier.name}` : 'Edit Supplier'}
        submitLabel="Simpan Perubahan"
        form={editForm}
        onSubmit={handleSubmitEdit}
      />

      <DeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        entityName="Supplier"
        itemName={selectedSupplier?.name ?? ''}
        isLoading={loading}
      />
    </div>
  )
}

interface SupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  submitLabel: string
  form: UseFormReturn<SupplierForm>
  onSubmit: (values: SupplierForm) => Promise<void>
}

const SupplierDialog = ({
  open,
  onOpenChange,
  title,
  submitLabel,
  form,
  onSubmit
}: SupplierDialogProps) => {
  const isSubmitting = form.formState.isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <SupplierFormFields
            register={form.register}
            errors={form.formState.errors}
          />

          <DialogFooter className="gap-2">
            <LoadingButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              hapticFeedback
              hapticType="light"
            >
              Batal
            </LoadingButton>
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              loadingText="Menyimpan..."
              hapticFeedback
              hapticType="medium"
            >
              {submitLabel}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}