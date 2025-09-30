'use client';

import React, { useState } from 'react';
import { useIngredients } from '@/hooks/useSupabaseCRUD';
import { SimpleDataTable } from '@/components/ui/simple-data-table';
import { Modal } from '@/components/ui/modal';
import { FormField, CrudForm, FormActions, FormGrid, FormSection, ConfirmDialog } from '@/components/ui/crud-form';
import { useFormValidation } from '@/hooks/useSupabaseCRUD';
import { useSettings } from '@/contexts/settings-context';
import { Database } from '@/types';

type Ingredient = Database['public']['Tables']['ingredients']['Row'];
type IngredientInsert = Database['public']['Tables']['ingredients']['Insert'];
type IngredientUpdate = Database['public']['Tables']['ingredients']['Update'];

interface IngredientFormData {
  name: string;
  unit: string;
  price_per_unit: number;  // Database field is price_per_unit, not cost_per_unit
  supplier?: string;       // Database field is supplier, not supplier_id
  minimum_stock: number;
  current_stock: number;
  description?: string;
  category?: string;       // Add category field from database
}

const validationRules = {
  name: (value: string) => !value ? 'Name is required' : null,
  unit: (value: string) => !value ? 'Unit is required' : null,
  price_per_unit: (value: number) => value <= 0 ? 'Price per unit must be greater than 0' : null,
  minimum_stock: (value: number) => value < 0 ? 'Minimum stock cannot be negative' : null,
  current_stock: (value: number) => value < 0 ? 'Current stock cannot be negative' : null,
  supplier: () => null,
  description: () => null,
  category: () => null,
};

// Unit options will be defined inside component to use "" function

export function IngredientsCRUD({ initialIngredients = [] }: { initialIngredients?: any[] }) {
  const { formatCurrency, settings } = useSettings();
  const { data: ingredients, loading, error, create, update, remove } = useIngredients({ initial: initialIngredients, refetchOnMount: false });
  
  // Unit options using i18n
  const unitOptions = [
    { value: 'kg', label: "Placeholder" },
    { value: 'g', label: "Placeholder" },
    { value: 'l', label: "Placeholder" },
    { value: 'ml', label: "Placeholder" },
    { value: 'pcs', label: "Placeholder" },
    { value: 'dozen', label: "Placeholder" },
  ];
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const initialFormData: IngredientFormData = {
    name: '',
    unit: '',
    price_per_unit: 0,
    supplier: '',
    minimum_stock: 0,
    current_stock: 0,
    description: '',
    category: '',
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
      header: "Placeholder",
      priority: 'high' as const,
    },
    {
      key: 'unit',
      header: "Placeholder",
      priority: 'high' as const,
    },
    {
      key: 'price_per_unit',
      header: "Placeholder",
      render: (value: number) => formatCurrency(value),
      hideOnMobile: true,
    },
    {
      key: 'current_stock',
      header: "Placeholder",
      render: (value: number, item: Ingredient) => `${value} ${item.unit}`,
      priority: 'medium' as const,
    },
    {
      key: 'minimum_stock',
      header: "Placeholder",
      render: (value: number, item: Ingredient) => `${value} ${item.unit}`,
      hideOnMobile: true,
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
    e.preventDefault;
    if (!validateAll()) return;

    try {
      await create(formData as any);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create ingredient:', error);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault;
    if (!validateAll() || !selectedIngredient) return;

    try {
      await update(selectedIngredient.id, formData as any);
      setIsEditModalOpen(false);
      setSelectedIngredient(ingredient);
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
      setSelectedIngredient(ingredient);
    } catch (error) {
      console.error('Failed to delete ingredient:', error);
    }
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedIngredient(ingredient);
    resetForm();
  };

  if (error) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 border border-red-200 rounded-md p-4">
        <p className="text-gray-600 dark:text-gray-400">{"Placeholder"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SimpleDataTable
        data={ingredients || []}
        columns={columns}
        searchPlaceholder={"Placeholder"}
        onAdd={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText={"Placeholder"}
        emptyMessage={"Placeholder"}
        exportData={true}
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeModals}
        title={"Placeholder"}
        size="lg"
        fullScreenOnMobile={true}
      >
        <CrudForm onSubmit={handleSubmitCreate}>
          <FormSection
            title={"Placeholder"}
            description={"Placeholder"}
          >
            <FormGrid cols={2}>
              <FormField
                label={"Placeholder"}
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name ? errors.name : undefined}
                required
                placeholder={"Placeholder"}
                hint={"Placeholder"}
              />

              <FormField
                label={"Placeholder"}
                name="unit"
                type="select"
                value={formData.unit}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.unit ? errors.unit : undefined}
                required
                options={unitOptions}
                hint={"Placeholder"}
              />
            </FormGrid>
          </FormSection>

          <FormSection
            title={"Placeholder"}
            description={"Placeholder"}
          >
            <FormField
label={"Placeholder"}
              name="price_per_unit"
              type="number"
              value={formData.price_per_unit}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.price_per_unit ? errors.price_per_unit : undefined}
              required
              min={0}
              step={0.01}
              hint={"Placeholder"}
            />

            <FormGrid cols={2}>
              <FormField
                label={"Placeholder"}
                name="current_stock"
                type="number"
                value={formData.current_stock}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.current_stock ? errors.current_stock : undefined}
                required
                min={0}
                step={0.01}
                hint={"Placeholder"}
              />

              <FormField
                label={"Placeholder"}
                name="minimum_stock"
                type="number"
                value={formData.minimum_stock}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.minimum_stock ? errors.minimum_stock : undefined}
                required
                min={0}
                step={0.01}
                hint={"Placeholder"}
              />
            </FormGrid>
          </FormSection>

          <FormSection title={"Placeholder"}>
            <FormField
              label={"Placeholder"}
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.description ? errors.description : undefined}
              placeholder={"Placeholder"}
              rows={3}
              hint={"Placeholder"}
            />
          </FormSection>

          <FormActions
            onCancel={closeModals}
            submitText={"Placeholder"}
            loading={loading}
            sticky={true}
          />
        </CrudForm>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeModals}
        title={"Placeholder"}
        size="lg"
        fullScreenOnMobile={true}
      >
        <CrudForm onSubmit={handleSubmitEdit}>
          <FormSection
            title={"Placeholder"}
            description={"Placeholder"}
          >
            <FormGrid cols={2}>
              <FormField
                label={"Placeholder"}
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name ? errors.name : undefined}
                required
                placeholder={"Placeholder"}
              />

              <FormField
                label={"Placeholder"}
                name="unit"
                type="select"
                value={formData.unit}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.unit ? errors.unit : undefined}
                required
                options={unitOptions}
              />
            </FormGrid>
          </FormSection>

          <FormSection
            title={"Placeholder"}
            description={"Placeholder"}
          >
            <FormField
              label={"Placeholder"}
              name="price_per_unit"
              type="number"
              value={formData.price_per_unit}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.price_per_unit ? errors.price_per_unit : undefined}
              required
              min={0}
              step={0.01}
            />

            <FormGrid cols={2}>
              <FormField
                label={"Placeholder"}
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
                label={"Placeholder"}
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
            </FormGrid>
          </FormSection>

          <FormSection title={"Placeholder"}>
            <FormField
              label={"Placeholder"}
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.description ? errors.description : undefined}
              placeholder={"Placeholder"}
              rows={3}
            />
          </FormSection>

          <FormActions
            onCancel={closeModals}
            submitText={"Placeholder"}
            loading={loading}
            sticky={true}
          />
        </CrudForm>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeModals}
        onConfirm={handleConfirmDelete}
        title={"Placeholder"}
        message={"Placeholder"}
        confirmText={"Placeholder"}
        type="danger"
      />
    </div>
  );
}