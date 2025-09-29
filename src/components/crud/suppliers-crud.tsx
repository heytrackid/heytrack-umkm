'use client';

import React, { useState } from 'react';
import { useSuppliers } from '@/hooks/useSupabaseCRUD';
import { DataTable } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { FormField, CrudForm, FormActions, FormGrid, FormSection, ConfirmDialog } from '@/components/ui/crud-form';
import { useFormValidation } from '@/hooks/useSupabaseCRUD';
import { Database } from '@/types/database';

// Using generic types since suppliers might not be in the database schema yet
type Supplier = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at: string;
  updated_at: string;
};
type SupplierInsert = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>;
type SupplierUpdate = Partial<SupplierInsert>;

interface SupplierFormData {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

const validationRules = {
  name: (value: string) => !value ? 'Name is required' : null,
  contact_person: () => null,
  phone: (value: string) => {
    if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
      return 'Invalid phone number format';
    }
    return null;
  },
  email: (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email format';
    }
    return null;
  },
  address: () => null,
  notes: () => null,
};

export function SuppliersCRUD() {
  const { data: suppliersData, loading, error, create, update, remove } = useSuppliers();
  const suppliers = suppliersData as Supplier[];
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const initialFormData: SupplierFormData = {
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  };

  const {
    values: formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
  } = useFormValidation(initialFormData, validationRules);

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
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    // Populate form with supplier data
    Object.keys(initialFormData).forEach(key => {
      handleChange(key as keyof SupplierFormData, (supplier as any)[key] || '');
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    try {
      await create(formData as SupplierInsert);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create supplier:', error);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll() || !selectedSupplier) return;

    try {
      await update(selectedSupplier.id, formData as SupplierUpdate);
      setIsEditModalOpen(false);
      setSelectedSupplier(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update supplier:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSupplier) return;

    try {
      await remove(selectedSupplier.id);
      setIsDeleteDialogOpen(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.error('Failed to delete supplier:', error);
    }
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedSupplier(null);
    resetForm();
  };

  if (error) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 border border-red-200 rounded-md p-4">
        <p className="text-gray-600 dark:text-gray-400">Error loading suppliers: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DataTable
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

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeModals}
        title="Add New Supplier"
        size="md"
      >
        <CrudForm onSubmit={handleSubmitCreate}>
          <FormField
            label="Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name ? errors.name : undefined}
            required
            placeholder="e.g., CV. Bahan Berkah"
          />

          <FormField
            label="Contact Person"
            name="contact_person"
            type="text"
            value={formData.contact_person}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.contact_person ? errors.contact_person : undefined}
            placeholder="e.g., John Doe"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Phone"
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.phone ? errors.phone : undefined}
              placeholder="+62 812-3456-7890"
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email ? errors.email : undefined}
              placeholder="contact@supplier.com"
            />
          </div>

          <FormField
            label="Address"
            name="address"
            type="textarea"
            value={formData.address}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.address ? errors.address : undefined}
            placeholder="Full address of the supplier"
            rows={3}
          />

          <FormField
            label="Notes"
            name="notes"
            type="textarea"
            value={formData.notes}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.notes ? errors.notes : undefined}
            placeholder="Additional notes or comments"
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
        <CrudForm onSubmit={handleSubmitEdit}>
          <FormField
            label="Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name ? errors.name : undefined}
            required
            placeholder="e.g., CV. Bahan Berkah"
          />

          <FormField
            label="Contact Person"
            name="contact_person"
            type="text"
            value={formData.contact_person}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.contact_person ? errors.contact_person : undefined}
            placeholder="e.g., John Doe"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Phone"
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.phone ? errors.phone : undefined}
              placeholder="+62 812-3456-7890"
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email ? errors.email : undefined}
              placeholder="contact@supplier.com"
            />
          </div>

          <FormField
            label="Address"
            name="address"
            type="textarea"
            value={formData.address}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.address ? errors.address : undefined}
            placeholder="Full address of the supplier"
            rows={3}
          />

          <FormField
            label="Notes"
            name="notes"
            type="textarea"
            value={formData.notes}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.notes ? errors.notes : undefined}
            placeholder="Additional notes or comments"
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