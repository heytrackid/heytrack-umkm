'use client';
import * as React from 'react';

import { ConfirmDialog, CrudForm, FormActions, FormField, FormGrid, FormSection } from '@/components/ui/crud-form';
import { Modal } from '@/components/ui/modal';
import { SimpleDataTable } from '@/components/ui/simple-data-table';
import { useSettings } from '@/contexts/settings-context';
import { useBahanBaku, useFormValidation } from '@/hooks/useSupabaseCRUD';
import { BahanBaku, BahanBakuFormData } from '@/types';
import { useState } from 'react';

const validationRules = {
  nama_bahan: (value: string) => !value ? 'Nama harus diisi' : null,
  satuan: (value: string) => !value ? 'Satuan harus diisi' : null,
  harga_per_satuan: (value: number) => value <= 0 ? 'Harga harus lebih dari 0' : null,
  stok_minimum: (value: number) => value < 0 ? 'Stok minimum tidak boleh negatif' : null,
  stok_tersedia: (value: number) => value < 0 ? 'Stok saat ini tidak boleh negatif' : null,
  jenis_kemasan: () => null,
};

export function IngredientsCRUD({ initialIngredients = [] }: { initialIngredients?: any[] }) {
  const { formatCurrency } = useSettings();
  const { data: ingredients, loading, error, create, update, remove } = useBahanBaku({
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
  const [selectedIngredient, setSelectedIngredient] = useState<BahanBaku | null>(null);

  const initialFormData: BahanBakuFormData = {
    nama_bahan: '',
    satuan: 'kg',
    harga_per_satuan: 0,
    stok_tersedia: 0,
    stok_minimum: 0,
    jenis_kemasan: '',
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
      key: 'nama_bahan',
      header: 'Nama Bahan',
      priority: 'high' as const,
    },
    {
      key: 'satuan',
      header: 'Satuan',
      priority: 'high' as const,
    },
    {
      key: 'harga_per_satuan',
      header: 'Harga/Unit',
      render: (value: number) => formatCurrency(value),
      hideOnMobile: true,
    },
    {
      key: 'stok_tersedia',
      header: 'Stok Saat Ini',
      render: (value: number, item: BahanBaku) => `${value} ${item.satuan}`,
      priority: 'medium' as const,
    },
    {
      key: 'stok_minimum',
      header: 'Stok Minimum',
      render: (value: number, item: BahanBaku) => `${value} ${item.satuan}`,
      hideOnMobile: true,
    },
  ];

  const handleCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEdit = (ingredient: BahanBaku) => {
    setSelectedIngredient(ingredient);
    Object.keys(initialFormData).forEach(key => {
      handleChange(key as keyof BahanBakuFormData, (ingredient as any)[key] || '');
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (ingredient: BahanBaku) => {
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
                name="nama_bahan"
                type="text"
                value={formData.nama_bahan}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.nama_bahan ? errors.nama_bahan : undefined}
                required
                hint="Nama bahan baku yang mudah dikenali"
              />

              <FormField
                label="Satuan"
                name="satuan"
                type="select"
                value={formData.satuan}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.satuan ? errors.satuan : undefined}
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
              name="harga_per_satuan"
              type="number"
              value={formData.harga_per_satuan}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.harga_per_satuan ? errors.harga_per_satuan : undefined}
              required
              min={0}
              step={0.01}
              hint="Harga per satuan dalam Rupiah"
            />

            <FormGrid cols={2}>
              <FormField
                label="Stok Saat Ini"
                name="stok_tersedia"
                type="number"
                value={formData.stok_tersedia}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.stok_tersedia ? errors.stok_tersedia : undefined}
                required
                min={0}
                step={0.01}
                hint="Jumlah stok yang tersedia sekarang"
              />

              <FormField
                label="Stok Minimum"
                name="stok_minimum"
                type="number"
                value={formData.stok_minimum}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.stok_minimum ? errors.stok_minimum : undefined}
                required
                min={0}
                step={0.01}
                hint="Batas minimum untuk alert stok"
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Informasi Tambahan">
            <FormField
              label="Jenis Kemasan"
              name="jenis_kemasan"
              type="text"
              value={formData.jenis_kemasan}
              onChange={handleChange}
              onBlur={handleBlur}
              hint="Jenis kemasan bahan ini (opsional)"
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
                name="nama_bahan"
                type="text"
                value={formData.nama_bahan}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.nama_bahan ? errors.nama_bahan : undefined}
                required
              />

              <FormField
                label="Satuan"
                name="satuan"
                type="select"
                value={formData.satuan}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.satuan ? errors.satuan : undefined}
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
              name="harga_per_satuan"
              type="number"
              value={formData.harga_per_satuan}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.harga_per_satuan ? errors.harga_per_satuan : undefined}
              required
              min={0}
              step={0.01}
            />

            <FormGrid cols={2}>
              <FormField
                label="Stok Saat Ini"
                name="stok_tersedia"
                type="number"
                value={formData.stok_tersedia}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.stok_tersedia ? errors.stok_tersedia : undefined}
                required
                min={0}
                step={0.01}
              />

              <FormField
                label="Stok Minimum"
                name="stok_minimum"
                type="number"
                value={formData.stok_minimum}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.stok_minimum ? errors.stok_minimum : undefined}
                required
                min={0}
                step={0.01}
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Informasi Tambahan">
            <FormField
              label="Jenis Kemasan"
              name="jenis_kemasan"
              type="text"
              value={formData.jenis_kemasan}
              onChange={handleChange}
              onBlur={handleBlur}
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
        message={`Apakah Anda yakin ingin menghapus "${selectedIngredient?.nama_bahan}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        type="danger"
      />
    </div>
  );
}

export default IngredientsCRUD;
