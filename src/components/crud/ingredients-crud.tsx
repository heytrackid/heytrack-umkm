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

interface IngredientFormData {
  name: string;
  unit: string;
  price_per_unit: number;
  supplier?: string;
  minimum_stock: number;
  current_stock: number;
  description?: string;
  category?: string;
}

const validationRules = {
  name: (value: string) => !value ? 'Nama harus diisi' : null,
  unit: (value: string) => !value ? 'Satuan harus diisi' : null,
  price_per_unit: (value: number) => value <= 0 ? 'Harga harus lebih dari 0' : null,
  minimum_stock: (value: number) => value < 0 ? 'Stok minimum tidak boleh negatif' : null,
  current_stock: (value: number) => value < 0 ? 'Stok saat ini tidak boleh negatif' : null,
  supplier: () => null,
  description: () => null,
  category: () => null,
};

export function IngredientsCRUD({ initialIngredients = [] }: { initialIngredients?: any[] }) {
  const { formatCurrency } = useSettings();
  const { data: ingredients, loading, error, create, update, remove } = useIngredients({ 
    initial: initialIngredients, 
    refetchOnMount: true 
  });
  
  const unitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'l', label: 'Liter (l)' },
    { value: 'ml', label: 'Mililiter (ml)' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'dozen', label: 'Lusin (dozen)' },
  ];

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const initialFormData: IngredientFormData = {
    name: '',
    unit: 'kg',
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
      header: 'Nama Bahan',
      priority: 'high' as const,
    },
    {
      key: 'unit',
      header: 'Satuan',
      priority: 'high' as const,
    },
    {
      key: 'price_per_unit',
      header: 'Harga/Unit',
      render: (value: number) => formatCurrency(value),
      hideOnMobile: true,
    },
    {
      key: 'current_stock',
      header: 'Stok Saat Ini',
      render: (value: number, item: Ingredient) => `${value} ${item.unit}`,
      priority: 'medium' as const,
    },
    {
      key: 'minimum_stock',
      header: 'Stok Minimum',
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
      await create(formData as any);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to create ingredient:', error);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll() || !selectedIngredient) return;

    try {
      await update(selectedIngredient.id, formData as any);
      setIsEditModalOpen(false);
      setSelectedIngredient(null);
      resetForm();
    } catch (error: any) {
      console.error('Failed to update ingredient:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedIngredient) return;

    try {
      await remove(selectedIngredient.id);
      setIsDeleteDialogOpen(false);
      setSelectedIngredient(null);
    } catch (error: any) {
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
      <div className="bg-gray-100 dark:bg-gray-800 border border-red-200 rounded-md p-4">
        <p className="text-gray-600 dark:text-gray-400">Gagal memuat data bahan baku</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SimpleDataTable
        data={ingredients || []}
        columns={columns}
        searchPlaceholder="Cari bahan baku..."
        onAdd={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="Tambah Bahan Baku"
        emptyMessage="Belum ada bahan baku. Klik tombol Tambah untuk menambahkan bahan baku pertama."
        exportData={true}
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeModals}
        title="Tambah Bahan Baku Baru"
        size="lg"
        fullScreenOnMobile={true}
      >
        <CrudForm onSubmit={handleSubmitCreate}>
          <FormSection
            title="Informasi Dasar"
            description="Isi informasi dasar bahan baku"
          >
            <FormGrid cols={2}>
              <FormField
                label="Nama Bahan"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name ? errors.name : undefined}
                required
                placeholder="Contoh: Tepung Terigu"
                hint="Nama bahan baku yang mudah dikenali"
              />

              <FormField
                label="Satuan"
                name="unit"
                type="select"
                value={formData.unit}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.unit ? errors.unit : undefined}
                required
                options={unitOptions}
                hint="Pilih satuan yang sesuai"
              />
            </FormGrid>
          </FormSection>

          <FormSection
            title="Harga & Stok"
            description="Atur harga dan stok bahan baku"
          >
            <FormField
              label="Harga per Unit"
              name="price_per_unit"
              type="number"
              value={formData.price_per_unit}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.price_per_unit ? errors.price_per_unit : undefined}
              required
              min={0}
              step={0.01}
              hint="Harga per satuan dalam Rupiah"
            />

            <FormGrid cols={2}>
              <FormField
                label="Stok Saat Ini"
                name="current_stock"
                type="number"
                value={formData.current_stock}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.current_stock ? errors.current_stock : undefined}
                required
                min={0}
                step={0.01}
                hint="Jumlah stok yang tersedia sekarang"
              />

              <FormField
                label="Stok Minimum"
                name="minimum_stock"
                type="number"
                value={formData.minimum_stock}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.minimum_stock ? errors.minimum_stock : undefined}
                required
                min={0}
                step={0.01}
                hint="Batas minimum untuk alert stok"
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Informasi Tambahan">
            <FormGrid cols={2}>
              <FormField
                label="Supplier"
                name="supplier"
                type="text"
                value={formData.supplier}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nama supplier"
                hint="Nama pemasok bahan ini (opsional)"
              />

              <FormField
                label="Kategori"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Contoh: Bahan Dasar"
                hint="Kategori untuk pengelompokan (opsional)"
              />
            </FormGrid>

            <FormField
              label="Deskripsi"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Deskripsi atau catatan tambahan"
              rows={3}
              hint="Catatan atau informasi tambahan tentang bahan ini (opsional)"
            />
          </FormSection>

          <FormActions
            onCancel={closeModals}
            submitText="Simpan Bahan Baku"
            loading={loading}
            sticky={true}
          />
        </CrudForm>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeModals}
        title="Edit Bahan Baku"
        size="lg"
        fullScreenOnMobile={true}
      >
        <CrudForm onSubmit={handleSubmitEdit}>
          <FormSection
            title="Informasi Dasar"
            description="Edit informasi dasar bahan baku"
          >
            <FormGrid cols={2}>
              <FormField
                label="Nama Bahan"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name ? errors.name : undefined}
                required
                placeholder="Contoh: Tepung Terigu"
              />

              <FormField
                label="Satuan"
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
            title="Harga & Stok"
            description="Edit harga dan stok bahan baku"
          >
            <FormField
              label="Harga per Unit"
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
                label="Stok Saat Ini"
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
                label="Stok Minimum"
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

          <FormSection title="Informasi Tambahan">
            <FormGrid cols={2}>
              <FormField
                label="Supplier"
                name="supplier"
                type="text"
                value={formData.supplier}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nama supplier"
              />

              <FormField
                label="Kategori"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Contoh: Bahan Dasar"
              />
            </FormGrid>

            <FormField
              label="Deskripsi"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Deskripsi atau catatan tambahan"
              rows={3}
            />
          </FormSection>

          <FormActions
            onCancel={closeModals}
            submitText="Simpan Perubahan"
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
        title="Hapus Bahan Baku"
        message={`Apakah Anda yakin ingin menghapus "${selectedIngredient?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        type="danger"
      />
    </div>
  );
}

export default IngredientsCRUD;
