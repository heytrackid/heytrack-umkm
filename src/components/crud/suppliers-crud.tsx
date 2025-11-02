'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import { useSuppliers } from '@/hooks';
import { useSupabaseCRUD } from '@/hooks/supabase';
import { SimpleDataTable, type SimpleColumn } from '@/components/ui/simple-data-table';
import { SupplierFormSchema, type SupplierForm } from '@/lib/validations/form-validations';
import { SupplierFormFields } from '@/components/forms/shared/SupplierFormFields';
import { CreateModal, EditModal, DeleteModal } from '@/components/ui';
import { apiLogger } from '@/lib/logger'
import type { SuppliersTable, SuppliersInsert, SuppliersUpdate } from '@/types/database'




// Shared components


type Supplier = SuppliersTable


export const SuppliersCRUD = () => {
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

  const handleCreate = () => {
    createForm.reset({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    })
    void setIsCreateModalOpen(true)
  }

  const handleEdit = (supplier: Supplier) => {
    void setSelectedSupplier(supplier)
    editForm.reset({
      name: supplier.name,
      contact_person: supplier.contact_person ?? '',
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      address: supplier.address ?? '',
      notes: supplier.notes ?? '',
    })
    void setIsEditModalOpen(true)
  }

  const handleDelete = (supplier: Supplier) => {
    void setSelectedSupplier(supplier)
    void setIsDeleteDialogOpen(true)
  }

  const handleSubmitCreate = async (data: Record<string, unknown>) => {
    try {
      await createSupplier(data as SuppliersInsert)
      void setIsCreateModalOpen(false)
      createForm.reset({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      })
    } catch (err: unknown) {
      apiLogger.error({ err }, 'Failed to create supplier:')
    }
  }

  const handleSubmitEdit = async (data: Record<string, unknown>) => {
    if (!selectedSupplier) { return }

    try {
      await updateSupplier(selectedSupplier.id, data as SuppliersUpdate)
      void setIsEditModalOpen(false)
      void setSelectedSupplier(null)
      editForm.reset({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      })
    } catch (err: unknown) {
      apiLogger.error({ err }, 'Failed to update supplier:')
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedSupplier) { return }

    try {
      await deleteSupplier(selectedSupplier.id)
      setIsDeleteDialogOpen(false);
      setSelectedSupplier(null);
    } catch (err: unknown) {
      apiLogger.error({ err }, 'Failed to delete supplier:');
    }
  }



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
