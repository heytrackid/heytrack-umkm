'use client';
import * as React from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useState } from 'react';
import { useSuppliers } from '@/hooks';
import { useSupabaseCRUD } from '@/hooks/supabase';
import { SimpleDataTable } from '@/components/ui/simple-data-table';
import { SupplierFormSchema, type SupplierForm } from '@/lib/validations/form-validations';

// Shared components
import { SupplierFormFields } from '@/components/forms/shared/SupplierFormFields';
import { CreateModal, EditModal, DeleteModal } from '@/components/ui';

import { apiLogger } from '@/lib/logger'

// Using generic types since suppliers might not be in the database schema yet
type Supplier = {
  id: string;
  name: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at: string;
  updated_at: string;
};
type SupplierInsert = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>;
type SupplierUpdate = Partial<SupplierInsert>;

export function SuppliersCRUD() {
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

  const columns = [
    {
      key: 'name',
      header: 'Name',
      priority: 'high' as const,
    },
    {
      key: 'contact_person',
      header: 'Contact Person',
      render: (value: string) => value || '-',
      priority: 'high' as const,
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (value: string) => value || '-',
      hideOnMobile: true,
    },
    {
      key: 'email',
      header: 'Email',
      render: (value: string) => value || '-',
      hideOnMobile: true,
    },
  ];

  const handleCreate = () => {
    createForm.reset()
    setIsCreateModalOpen(true)
  }

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    editForm.reset({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      notes: '' // Notes field not in supplier type
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitCreate = async (data: SupplierForm) => {
    try {
      await createSupplier(data)
      setIsCreateModalOpen(false)
      createForm.reset()
    } catch (error: unknown) {
      apiLogger.error({ error }, 'Failed to create supplier:')
    }
  }

  const handleSubmitEdit = async (data: SupplierForm) => {
    if (!selectedSupplier) {return}

    try {
      await updateSupplier(selectedSupplier.id, data)
      setIsEditModalOpen(false)
      setSelectedSupplier(null)
      editForm.reset()
    } catch (error: unknown) {
      apiLogger.error({ error }, 'Failed to update supplier:')
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedSupplier) {return}

    try {
      await deleteSupplier(selectedSupplier.id)
      setIsDeleteDialogOpen(false);
      setSelectedSupplier(null);
    } catch (error: unknown) {
      apiLogger.error({ error }, 'Failed to delete supplier:');
    }
  }

  const closeModals = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteDialogOpen(false)
    setSelectedSupplier(null)
    createForm.reset()
    editForm.reset()
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
        itemName={selectedSupplier?.name}
        isLoading={loading}
      />
    </div>
  );
}