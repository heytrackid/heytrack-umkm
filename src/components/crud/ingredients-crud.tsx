'use client';

import React, { useState } from 'react';
import { useIngredients } from '@/hooks/useSupabaseCRUD';
import { DataTable } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { FormField, CrudForm, FormActions, ConfirmDialog } from '@/components/ui/crud-form';
import { useFormValidation } from '@/hooks/useSupabaseCRUD';
import { Database } from '@/types/database';

type Ingredient = Database['public']['Tables']['ingredients']['Row'];
type IngredientInsert = Database['public']['Tables']['ingredients']['Insert'];
type IngredientUpdate = Database['public']['Tables']['ingredients']['Update'];

interface IngredientFormData {
  name: string;
  unit: string;
  cost_per_unit: number;
  supplier_id?: string;
  minimum_stock: number;
  current_stock: number;
  description?: string;
}

const validationRules = {
  name: (value: string) => !value ? 'Name is required' : null,
  unit: (value: string) => !value ? 'Unit is required' : null,
  cost_per_unit: (value: number) => value <= 0 ? 'Cost per unit must be greater than 0' : null,
  minimum_stock: (value: number) => value < 0 ? 'Minimum stock cannot be negative' : null,
  current_stock: (value: number) => value < 0 ? 'Current stock cannot be negative' : null,
  supplier_id: () => null,
  description: () => null,
};

const unitOptions = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'l', label: 'Liter (l)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'dozen', label: 'Dozen' },
];

export function IngredientsCRUD() {
  const { data: ingredients, loading, error, create, update, remove } = useIngredients();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const initialFormData: IngredientFormData = {
    name: '',
    unit: '',
    cost_per_unit: 0,
    supplier_id: '',
    minimum_stock: 0,
    current_stock: 0,
    description: '',
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
    },
    {
      key: 'unit',
      header: 'Unit',
    },
    {
      key: 'cost_per_unit',
      header: 'Cost per Unit',
      render: (value: number) => `Rp ${value.toLocaleString()}`,
    },
    {
      key: 'current_stock',
      header: 'Current Stock',
      render: (value: number, item: Ingredient) => `${value} ${item.unit}`,
    },
    {
      key: 'minimum_stock',
      header: 'Min Stock',
      render: (value: number, item: Ingredient) => `${value} ${item.unit}`,
    },
  ];

  const handleCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    // Populate form with ingredient data
    Object.keys(initialFormData).forEach(key => {
      handleChange(key as keyof IngredientFormData, (ingredient as any)[key] || '');
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    try {
      await create(formData as IngredientInsert);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create ingredient:', error);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll() || !selectedIngredient) return;

    try {
      await update(selectedIngredient.id, formData as IngredientUpdate);
      setIsEditModalOpen(false);
      setSelectedIngredient(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update ingredient:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedIngredient) return;

    try {
      await remove(selectedIngredient.id);
      setIsDeleteDialogOpen(false);
      setSelectedIngredient(null);
    } catch (error) {
      console.error('Failed to delete ingredient:', error);
    }
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedIngredient(null);
    resetForm();
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">Error loading ingredients: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DataTable
        data={ingredients}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        title="Ingredients"
        createButtonText="Add Ingredient"
        emptyMessage="No ingredients found. Add your first ingredient to get started."
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeModals}
        title="Add New Ingredient"
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
            placeholder="e.g., Flour, Sugar, Butter"
          />

          <FormField
            label="Unit"
            name="unit"
            type="select"
            value={formData.unit}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.unit ? errors.unit : undefined}
            required
            options={unitOptions}
          />

          <FormField
            label="Cost per Unit (Rp)"
            name="cost_per_unit"
            type="number"
            value={formData.cost_per_unit}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.cost_per_unit ? errors.cost_per_unit : undefined}
            required
            min={0}
            step={0.01}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Current Stock"
              name="current_stock"
              type="number"
              value={formData.current_stock}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.current_stock ? errors.current_stock : undefined}
              required
              min={0}
              step={0.01}
            />

            <FormField
              label="Minimum Stock"
              name="minimum_stock"
              type="number"
              value={formData.minimum_stock}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.minimum_stock ? errors.minimum_stock : undefined}
              required
              min={0}
              step={0.01}
            />
          </div>

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.description ? errors.description : undefined}
            placeholder="Optional description or notes"
            rows={3}
          />

          <FormActions
            onCancel={closeModals}
            submitText="Create Ingredient"
            loading={loading}
          />
        </CrudForm>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeModals}
        title="Edit Ingredient"
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
            placeholder="e.g., Flour, Sugar, Butter"
          />

          <FormField
            label="Unit"
            name="unit"
            type="select"
            value={formData.unit}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.unit ? errors.unit : undefined}
            required
            options={unitOptions}
          />

          <FormField
            label="Cost per Unit (Rp)"
            name="cost_per_unit"
            type="number"
            value={formData.cost_per_unit}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.cost_per_unit ? errors.cost_per_unit : undefined}
            required
            min={0}
            step={0.01}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Current Stock"
              name="current_stock"
              type="number"
              value={formData.current_stock}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.current_stock ? errors.current_stock : undefined}
              required
              min={0}
              step={0.01}
            />

            <FormField
              label="Minimum Stock"
              name="minimum_stock"
              type="number"
              value={formData.minimum_stock}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.minimum_stock ? errors.minimum_stock : undefined}
              required
              min={0}
              step={0.01}
            />
          </div>

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.description ? errors.description : undefined}
            placeholder="Optional description or notes"
            rows={3}
          />

          <FormActions
            onCancel={closeModals}
            submitText="Update Ingredient"
            loading={loading}
          />
        </CrudForm>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeModals}
        onConfirm={handleConfirmDelete}
        title="Delete Ingredient"
        message={`Are you sure you want to delete "${selectedIngredient?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}