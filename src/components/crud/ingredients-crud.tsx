'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useSettings } from '@/contexts/settings-context'
import { useIngredients } from '@/hooks'
import { useSupabaseCRUD } from '@/hooks/supabase'
import { IngredientFormSchema, type SimpleIngredientFormData } from '@/lib/validations/form-validations'
import type { Database } from '@/types'

import { apiLogger } from '@/lib/logger'

// Shared components
import { IngredientFormFields } from '@/components/forms/shared/IngredientFormFields';
import { CreateModal, EditModal, DeleteModal } from '@/components/ui';
import { SimpleDataTable } from '@/components/ui/simple-data-table';

type Ingredient = Database['public']['Tables']['ingredients']['Row'];

export const IngredientsCRUD = ({ initialIngredients = [] }: { initialIngredients?: unknown[] }) => {
  const { formatCurrency } = useSettings();
  const { data: ingredients, loading, error } = useIngredients();
  const { create: createIngredient, update: updateIngredient, delete: deleteIngredient } = useSupabaseCRUD('ingredients');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const createForm = useForm<SimpleIngredientFormData>({
    resolver: zodResolver(IngredientFormSchema),
    defaultValues: {
      name: '',
      unit: 'kg',
      price_per_unit: 0,
      current_stock: 0,
      min_stock: 0,
      description: '',
    }
  });

  const editForm = useForm<SimpleIngredientFormData>({
    resolver: zodResolver(IngredientFormSchema),
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
      render: (value: number, item: Ingredient) => `${value} ${(item as any).unit}`,
      priority: 'medium' as const,
    },
    {
      key: 'min_stock',
      header: 'Stok Minimum',
      render: (value: number, item: Ingredient) => `${value} ${(item as any).unit}`,
      hideOnMobile: true,
    },
  ];

  const handleCreate = () => {
    createForm.reset()
    void setIsCreateModalOpen(true)
  }

  const handleEdit = (ingredient: Ingredient) => {
    void setSelectedIngredient(ingredient)
    const ing = ingredient as any
    editForm.reset({
      name: ing.name || ing.nama_bahan,
      unit: ing.unit || ing.satuan,
      price_per_unit: ing.price_per_unit || ing.harga_per_satuan,
      current_stock: ing.current_stock || ing.stok_tersedia,
      min_stock: ing.min_stock || ing.minimum_stock || ing.stok_minimum,
      description: ing.description || ing.jenis_kemasan || '',
    })
    void setIsEditModalOpen(true)
  }

  const handleDelete = (ingredient: Ingredient) => {
    void setSelectedIngredient(ingredient)
    void setIsDeleteDialogOpen(true)
  }

  const handleSubmitCreate = async (data: SimpleIngredientFormData) => {
    try {
      await createIngredient(data)
      void setIsCreateModalOpen(false)
      createForm.reset()
    } catch (err: unknown) {
      apiLogger.error({ error }, 'Failed to create ingredient:')
    }
  }

  const handleSubmitEdit = async (data: SimpleIngredientFormData) => {
    if (!selectedIngredient) { return }

    try {
      await updateIngredient(selectedIngredient.id, data)
      void setIsEditModalOpen(false)
      void setSelectedIngredient(null)
      editForm.reset()
    } catch (err: unknown) {
      apiLogger.error({ error }, 'Failed to update ingredient:')
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedIngredient) { return; }

    try {
      await deleteIngredient(selectedIngredient.id);
      setIsDeleteDialogOpen(false);
      setSelectedIngredient(null);
    } catch (err: unknown) {
      apiLogger.error({ error }, 'Failed to delete ingredient:');
    }
  };

  const closeModals = () => {
    void setIsCreateModalOpen(false)
    void setIsEditModalOpen(false)
    void setIsDeleteDialogOpen(false)
    void setSelectedIngredient(null)
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
        exportData
      />

      {/* Create Modal */}
      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        entityName="Bahan Baku"
        form={createForm}
        onSubmit={handleSubmitCreate}
        isLoading={loading}
      >
        <IngredientFormFields
          register={createForm.register}
          errors={createForm.formState.errors}
        />
      </CreateModal>

      {/* Edit Modal */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        entityName="Bahan Baku"
        form={editForm}
        onSubmit={handleSubmitEdit}
        isLoading={loading}
      >
        <IngredientFormFields
          register={editForm.register}
          errors={editForm.formState.errors}
        />
      </EditModal>

      {/* Delete Confirmation Dialog */}
      <DeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        entityName="Bahan Baku"
        itemName={(selectedIngredient as any)?.name || (selectedIngredient as any)?.nama_bahan}
        isLoading={loading}
      />
    </div>
  );
}

export default IngredientsCRUD;
