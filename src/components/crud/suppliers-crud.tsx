'use client'

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { SupplierFormFields } from '@/components/forms/shared/SupplierFormFields';
import { CreateModal, EditModal, DeleteModal } from '@/components/ui';
import { SimpleDataTable, type SimpleColumn } from '@/components/ui/simple-data-table';
import { useSuppliers } from '@/hooks';
import { useSupabaseCRUD } from '@/hooks/supabase';
import { createClientLogger } from '@/lib/client-logger'
import { SupplierFormSchema, type SupplierForm } from '@/lib/validations/form-validations';

const logger = createClientLogger('SuppliersCRUD')
import type { Row, Insert, Update } from '@/types/database'




// Shared components


type Supplier = Row<'suppliers'>


export const SuppliersCRUD = (): JSX.Element => {
  const { data: suppliersData, loading, error } = useSuppliers();
  const { create: createSupplier, update: updateSupplier, delete: deleteSupplier } = useSupabaseCRUD('suppliers');
  const suppliers = suppliersData || [];
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const createForm = useForm<SupplierForm>({
    resolver: zodResolver(SupplierFormSchema),
    defaultValues: {
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    }
  });

  // Reset create form when modal opens
  useEffect(() => {
    if (isCreateModalOpen) {
      createForm.reset({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      })
    }
  }, [isCreateModalOpen, createForm])

  const editForm = useForm<SupplierForm>({
    resolver: zodResolver(SupplierFormSchema),
    defaultValues: {
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    }
  });

  const columns: Array<SimpleColumn<Supplier>> = [
    {
      key: 'name',
      header: 'Name',
    },
    {
      key: 'contact_person',
      header: 'Contact Person',
      accessor: (supplier) => supplier.contact_person,
      render: (value) => (value as string | null) ?? '-',
    },
    {
      key: 'phone',
      header: 'Phone',
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
  ];

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

  const handleSubmitCreate = useCallback(async (data: Record<string, unknown>): Promise<void> => {
    try {
      await createSupplier(data as Insert<'suppliers'>)
      setIsCreateModalOpen(false)
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to create supplier:')
    }
  }, [createSupplier])

  const handleSubmitEdit = useCallback(async (data: Record<string, unknown>) => {
    if (!selectedSupplier) { return }

    try {
      await updateSupplier(selectedSupplier['id'], data as Update<'suppliers'>)
      setIsEditModalOpen(false)
      setSelectedSupplier(null)
      editForm.reset({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      })
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to update supplier:')
    }
  }, [selectedSupplier, updateSupplier, editForm])

  const handleConfirmDelete = useCallback(async (): Promise<void> => {
    if (!selectedSupplier) { return }

    try {
      await deleteSupplier(selectedSupplier['id'])
      setIsDeleteDialogOpen(false);
      setSelectedSupplier(null);
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to delete supplier:');
    }
  }, [selectedSupplier, deleteSupplier])



  if (error) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 border border-red-200 rounded-md p-4">
        <p className="text-gray-600 dark:text-gray-400">Error loading suppliers: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SimpleDataTable
        data={suppliers}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleCreate}
        title="Suppliers"
        addButtonText="Add Supplier"
        emptyMessage="No suppliers found. Add your first supplier to get started."
      />

      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        entityName="Supplier"
        form={createForm}
        onSubmit={handleSubmitCreate}
        isLoading={loading}
      >
        <SupplierFormFields
          register={createForm.register}
          errors={createForm.formState.errors}
        />
      </CreateModal>

      {/* Edit Modal */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        entityName="Supplier"
        form={editForm}
        onSubmit={handleSubmitEdit}
        isLoading={loading}
      >
        <SupplierFormFields
          register={editForm.register}
          errors={editForm.formState.errors}
        />
      </EditModal>

      {/* Delete Confirmation Dialog */}
      <DeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        entityName="Supplier"
        itemName={selectedSupplier?.name ?? ''}
        isLoading={loading}
      />
    </div>
  );
}
