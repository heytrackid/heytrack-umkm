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
      nama_bahan: '',
      satuan: 'kg',
      harga_per_satuan: 0,
      stok_tersedia: 0,
      stok_minimum: 0,
      jenis_kemasan: '',
    }
  });

  const editForm = useForm<BahanBakuFormData>({
    resolver: zodResolver(BahanBakuSchema),
    defaultValues: {
      nama_bahan: '',
      satuan: 'kg',
      harga_per_satuan: 0,
      stok_tersedia: 0,
      stok_minimum: 0,
      jenis_kemasan: '',
    }
  });

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
    createForm.reset()
    setIsCreateModalOpen(true)
  }

  const handleEdit = (ingredient: BahanBaku) => {
    setSelectedIngredient(ingredient)
    editForm.reset({
      nama_bahan: ingredient.nama_bahan,
      satuan: ingredient.satuan,
      harga_per_satuan: ingredient.harga_per_satuan,
      stok_tersedia: ingredient.stok_tersedia,
      stok_minimum: ingredient.stok_minimum,
      jenis_kemasan: ingredient.jenis_kemasan || '',
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
                name="nama_bahan"
                type="text"
                {...createForm.register('nama_bahan')}
                error={createForm.formState.errors.nama_bahan?.message}
                required
                hint="Nama bahan baku yang mudah dikenali"
              />

              <FormField
                label="Satuan"
                name="satuan"
                type="select"
                {...createForm.register('satuan')}
                error={createForm.formState.errors.satuan?.message}
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
              {...createForm.register('harga_per_satuan', { valueAsNumber: true })}
              error={createForm.formState.errors.harga_per_satuan?.message}
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
                {...createForm.register('stok_tersedia', { valueAsNumber: true })}
                error={createForm.formState.errors.stok_tersedia?.message}
                required
                min={0}
                step={0.01}
                hint="Jumlah stok yang tersedia sekarang"
              />

              <FormField
                label="Stok Minimum"
                name="stok_minimum"
                type="number"
                {...createForm.register('stok_minimum', { valueAsNumber: true })}
                error={createForm.formState.errors.stok_minimum?.message}
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
              {...createForm.register('jenis_kemasan')}
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
        <CrudForm onSubmit={editForm.handleSubmit(handleSubmitEdit)}>
          <FormSection
            title="Informasi Dasar"
            description="Edit informasi dasar bahan baku"
          >
            <FormGrid cols={2}>
              <FormField
                label="Nama Bahan"
                name="nama_bahan"
                type="text"
                {...editForm.register('nama_bahan')}
                error={editForm.formState.errors.nama_bahan?.message}
                required
              />

              <FormField
                label="Satuan"
                name="satuan"
                type="select"
                {...editForm.register('satuan')}
                error={editForm.formState.errors.satuan?.message}
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
              {...editForm.register('harga_per_satuan', { valueAsNumber: true })}
              error={editForm.formState.errors.harga_per_satuan?.message}
              required
              min={0}
              step={0.01}
            />

            <FormGrid cols={2}>
              <FormField
                label="Stok Saat Ini"
                name="stok_tersedia"
                type="number"
                {...editForm.register('stok_tersedia', { valueAsNumber: true })}
                error={editForm.formState.errors.stok_tersedia?.message}
                required
                min={0}
                step={0.01}
              />

              <FormField
                label="Stok Minimum"
                name="stok_minimum"
                type="number"
                {...editForm.register('stok_minimum', { valueAsNumber: true })}
                error={editForm.formState.errors.stok_minimum?.message}
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
              {...editForm.register('jenis_kemasan')}
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
