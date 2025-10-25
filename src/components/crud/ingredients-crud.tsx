'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ConfirmDialog, CrudForm, FormActions, FormField, FormGrid, FormSection } from '@/components/ui/crud-form';
import { Modal } from '@/components/ui/modal';
import { SimpleDataTable } from '@/components/ui/simple-data-table';
import { useSettings } from '@/contexts/settings-context';
import { useBahanBaku } from '@/hooks/useSupabaseCRUD';
import { BahanBaku } from '@/types';
import { BahanBakuSchema, type BahanBakuFormData } from '@/lib/validations/form-validations';
import { useState } from 'react';

import { apiLogger } from '@/lib/logger'

export function IngredientsCRUD({ initialIngredients = [] }: { initialIngredients?: unknown[] }) {
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

  const createForm = useForm<BahanBakuFormData>({
    resolver: zodResolver(BahanBakuSchema),
    defaultValues: {
      name: '',
      unit: 'kg',
      price_per_unit: 0,
      current_stock: 0,
      min_stock: 0,
      description: '',
    }
  });

  const editForm = useForm<BahanBakuFormData>({
    resolver: zodResolver(BahanBakuSchema),
    defaultValues: {
      name: '',
      unit: 'kg',
      price_per_unit: 0,
      current_stock: 0,
      min_stock: 0,
      description: '',
    }
  });

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
      render: (value: number, item: BahanBaku) => `${value} ${(item as any).unit}`,
      priority: 'medium' as const,
    },
    {
      key: 'min_stock',
      header: 'Stok Minimum',
      render: (value: number, item: BahanBaku) => `${value} ${(item as any).unit}`,
      hideOnMobile: true,
    },
  ];

  const handleCreate = () => {
    createForm.reset()
    setIsCreateModalOpen(true)
  }

  const handleEdit = (ingredient: BahanBaku) => {
    setSelectedIngredient(ingredient)
    const ing = ingredient as any
    editForm.reset({
      name: ing.name || ing.nama_bahan,
      unit: ing.unit || ing.satuan,
      price_per_unit: ing.price_per_unit || ing.harga_per_satuan,
      current_stock: ing.current_stock || ing.stok_tersedia,
      min_stock: ing.min_stock || ing.minimum_stock || ing.stok_minimum,
      description: ing.description || ing.jenis_kemasan || '',
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (ingredient: BahanBaku) => {
    setSelectedIngredient(ingredient)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitCreate = async (data: BahanBakuFormData) => {
    try {
      await create(data)
      setIsCreateModalOpen(false)
      createForm.reset()
    } catch (error: unknown) {
      apiLogger.error({ error: error }, 'Failed to create ingredient:')
    }
  }

  const handleSubmitEdit = async (data: BahanBakuFormData) => {
    if (!selectedIngredient) return

    try {
      await update(selectedIngredient.id, data)
      setIsEditModalOpen(false)
      setSelectedIngredient(null)
      editForm.reset()
    } catch (error: unknown) {
      apiLogger.error({ error: error }, 'Failed to update ingredient:')
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedIngredient) return;

    try {
      await remove(selectedIngredient.id);
      setIsDeleteDialogOpen(false);
      setSelectedIngredient(null);
    } catch (error: unknown) {
      apiLogger.error({ error: error }, 'Failed to delete ingredient:');
    }
  };

  const closeModals = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteDialogOpen(false)
    setSelectedIngredient(null)
    createForm.reset()
    editForm.reset()
  }

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
        <CrudForm onSubmit={createForm.handleSubmit(handleSubmitCreate)}>
          <FormSection
            title="Informasi Dasar"
            description="Masukkan informasi dasar bahan baku"
          >
            <FormGrid cols={2}>
              <FormField
                label="Nama Bahan"
                name="name"
                type="text"
                {...createForm.register('name')}
                error={createForm.formState.errors.name?.message}
                required
                hint="Nama bahan baku yang mudah dikenali"
              />

              <FormField
                label="Satuan"
                name="unit"
                type="select"
                {...createForm.register('unit')}
                error={createForm.formState.errors.unit?.message}
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
              {...createForm.register('price_per_unit', { valueAsNumber: true })}
              error={createForm.formState.errors.price_per_unit?.message}
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
                {...createForm.register('current_stock', { valueAsNumber: true })}
                error={createForm.formState.errors.current_stock?.message}
                required
                min={0}
                step={0.01}
                hint="Jumlah stok yang tersedia sekarang"
              />

              <FormField
                label="Stok Minimum"
                name="min_stock"
                type="number"
                {...createForm.register('min_stock', { valueAsNumber: true })}
                error={createForm.formState.errors.min_stock?.message}
                required
                min={0}
                step={0.01}
                hint="Batas minimum untuk alert stok"
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Informasi Tambahan">
            <FormField
              label="Deskripsi"
              name="description"
              type="text"
              {...createForm.register('description')}
              hint="Deskripsi atau catatan tambahan (opsional)"
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
        <CrudForm onSubmit={editForm.handleSubmit(handleSubmitEdit)}>
          <FormSection
            title="Informasi Dasar"
            description="Edit informasi dasar bahan baku"
          >
            <FormGrid cols={2}>
              <FormField
                label="Nama Bahan"
                name="name"
                type="text"
                {...editForm.register('name')}
                error={editForm.formState.errors.name?.message}
                required
              />

              <FormField
                label="Satuan"
                name="unit"
                type="select"
                {...editForm.register('unit')}
                error={editForm.formState.errors.unit?.message}
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
              {...editForm.register('price_per_unit', { valueAsNumber: true })}
              error={editForm.formState.errors.price_per_unit?.message}
              required
              min={0}
              step={0.01}
            />

            <FormGrid cols={2}>
              <FormField
                label="Stok Saat Ini"
                name="current_stock"
                type="number"
                {...editForm.register('current_stock', { valueAsNumber: true })}
                error={editForm.formState.errors.current_stock?.message}
                required
                min={0}
                step={0.01}
              />

              <FormField
                label="Stok Minimum"
                name="min_stock"
                type="number"
                {...editForm.register('min_stock', { valueAsNumber: true })}
                error={editForm.formState.errors.min_stock?.message}
                required
                min={0}
                step={0.01}
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Informasi Tambahan">
            <FormField
              label="Deskripsi"
              name="description"
              type="text"
              {...editForm.register('description')}
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
        message={`Apakah Anda yakin ingin menghapus "${(selectedIngredient as any)?.name || (selectedIngredient as any)?.nama_bahan}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        type="danger"
      />
    </div>
  );
}

export default IngredientsCRUD;
