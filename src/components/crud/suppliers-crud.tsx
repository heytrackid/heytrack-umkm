'use client';
import * as React from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useState } from 'react';
import { useSuppliers } from '@/hooks/useSupabaseCRUD';
import { SimpleDataTable } from '@/components/ui/simple-data-table';
import { Modal } from '@/components/ui/modal';
import { FormField, CrudForm, FormActions, FormGrid, FormSection, ConfirmDialog } from '@/components/ui/crud-form';
import { SupplierFormSchema, type SupplierForm } from '@/lib/validations/form-validations';
import { Database } from '@/types';

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
  const { data: suppliersData, loading, error, create, update, remove } = useSuppliers();
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
      await create(data)
      setIsCreateModalOpen(false)
      createForm.reset()
    } catch (error: unknown) {
      apiLogger.error({ error }, 'Failed to create supplier:')
    }
  }

  const handleSubmitEdit = async (data: SupplierForm) => {
    if (!selectedSupplier) return

    try {
      await update(selectedSupplier.id, data)
      setIsEditModalOpen(false)
      setSelectedSupplier(null)
      editForm.reset()
    } catch (error: unknown) {
      apiLogger.error({ error }, 'Failed to update supplier:')
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedSupplier) return

    try {
      await remove(selectedSupplier.id)
      setIsDeleteDialogOpen(false)
      setSelectedSupplier(null)
    } catch (error: unknown) {
      apiLogger.error({ error }, 'Failed to delete supplier:')
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
        onCreate={handleCreate}
        title="Suppliers"
        createButtonText="Add Supplier"
        emptyMessage="No suppliers found. Add your first supplier to get started."
        searchable={true}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeModals}
        title="Add New Supplier"
        size="md"
      >
        <CrudForm onSubmit={createForm.handleSubmit(handleSubmitCreate)}>
          <FormField
            label="Name"
            name="name"
            type="text"
            {...createForm.register('name')}
            error={createForm.formState.errors.name?.message}
            required
          />

          <FormField
            label="Contact Person"
            name="contact_person"
            type="text"
            {...createForm.register('contact_person')}
            error={createForm.formState.errors.contact_person?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Phone"
              name="phone"
              type="text"
              {...createForm.register('phone')}
              error={createForm.formState.errors.phone?.message}
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              {...createForm.register('email')}
              error={createForm.formState.errors.email?.message}
            />
          </div>

          <FormField
            label="Address"
            name="address"
            type="textarea"
            {...createForm.register('address')}
            error={createForm.formState.errors.address?.message}
            rows={3}
          />

          <FormField
            label="Notes"
            name="notes"
            type="textarea"
            {...createForm.register('notes')}
            error={createForm.formState.errors.notes?.message}
            rows={2}
          />

          <FormActions
            onCancel={closeModals}
            submitText="Create Supplier"
            loading={loading}
          />
        </CrudForm>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeModals}
        title="Edit Supplier"
        size="md"
      >
        <CrudForm onSubmit={editForm.handleSubmit(handleSubmitEdit)}>
          <FormField
            label="Name"
            name="name"
            type="text"
            {...editForm.register('name')}
            error={editForm.formState.errors.name?.message}
            required
          />

          <FormField
            label="Contact Person"
            name="contact_person"
            type="text"
            {...editForm.register('contact_person')}
            error={editForm.formState.errors.contact_person?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Phone"
              name="phone"
              type="text"
              {...editForm.register('phone')}
              error={editForm.formState.errors.phone?.message}
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              {...editForm.register('email')}
              error={editForm.formState.errors.email?.message}
            />
          </div>

          <FormField
            label="Address"
            name="address"
            type="textarea"
            {...editForm.register('address')}
            error={editForm.formState.errors.address?.message}
            rows={3}
          />

          <FormField
            label="Notes"
            name="notes"
            type="textarea"
            {...editForm.register('notes')}
            error={editForm.formState.errors.notes?.message}
            rows={2}
          />

          <FormActions
            onCancel={closeModals}
            submitText="Update Supplier"
            loading={loading}
          />
        </CrudForm>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeModals}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier"
        message={`Are you sure you want to delete"${selectedSupplier?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}