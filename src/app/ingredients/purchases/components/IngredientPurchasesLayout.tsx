'use client'

import { useEffect, useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { BreadcrumbPatterns, DeleteModal, PageBreadcrumb } from '@/components/ui/index'
import { useAuth } from '@/hooks/index'
import { infoToast, successToast } from '@/hooks/use-toast'
import { useCreateIngredientPurchase, useDeleteIngredientPurchase, useIngredientPurchases } from '@/hooks/useIngredientPurchases'
import { useIngredientsList } from '@/hooks/useIngredients'
import { handleError } from '@/lib/error-handling'


import { PurchaseForm } from '@/app/ingredients/purchases/components/PurchaseForm'
import { PurchasesTable } from '@/app/ingredients/purchases/components/PurchasesTable'
import { PurchaseStats } from '@/app/ingredients/purchases/components/PurchaseStats'
import type { IngredientPurchase } from '@/app/ingredients/purchases/components/types'



const IngredientPurchasesLayout = (): JSX.Element => {
  const { data: purchases = [], isLoading: _purchasesLoading, error: purchasesError, refetch: refetchPurchases } = useIngredientPurchases()
  const { data: ingredients = [], isLoading: _ingredientsLoading } = useIngredientsList()
  const createPurchase = useCreateIngredientPurchase()
  const deletePurchase = useDeleteIngredientPurchase()
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [purchaseToDelete, setPurchaseToDelete] = useState<IngredientPurchase | null>(null)
  const [isBulkDelete, setIsBulkDelete] = useState(false)
  const [purchasesToDelete, setPurchasesToDelete] = useState<IngredientPurchase[]>([])

  // Handle auth errors
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      handleError(new Error('Authentication required'), 'Auth check', false)
    }
  }, [isAuthLoading, isAuthenticated])

  // Handle data fetch errors
  useEffect(() => {
    if (purchasesError) {
      handleError(purchasesError, 'Load ingredient purchases', true, 'Gagal memuat data pembelian')
    }
  }, [purchasesError])

  const handlePurchaseSubmit = async (formData: {
    ingredient_id: string;
    quantity: number;
    unit_price: number;
    supplier?: string | null | undefined;
    purchase_date?: string | undefined;
    notes?: string | null | undefined;
  }) => {
    const totalPrice = formData.quantity * formData.unit_price;

    // Note: user_id will be handled by the API route authentication
    await createPurchase.mutateAsync({
      ingredient_id: formData.ingredient_id,
      quantity: formData.quantity,
      unit_price: formData.unit_price,
      total_price: totalPrice,
      supplier: formData.supplier ?? null,
       purchase_date: formData.purchase_date || null,
      notes: formData.notes ?? null,
    })
  }

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <PageBreadcrumb items={BreadcrumbPatterns.ingredientPurchases} />

          <PageHeader
            title="Pembelian Bahan Baku"
            description="Kelola riwayat pembelian bahan baku"
          />

          <div className="h-96 bg-muted rounded animate-pulse" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageBreadcrumb items={BreadcrumbPatterns.ingredientPurchases} />

        <PageHeader
          title="Pembelian Bahan Baku"
          description="Kelola riwayat pembelian bahan baku"
          actions={
            <PurchaseForm
              ingredients={ingredients}
              onSubmit={handlePurchaseSubmit}
              onSuccess={() => { }}
            />
          }
        />

        {/* Purchase Stats - Lazy Loaded */}
        <PurchaseStats purchases={purchases as IngredientPurchase[]} />

        {/* Purchases Table - Lazy Loaded */}
        <PurchasesTable
          purchases={purchases as IngredientPurchase[]}
          onRefresh={() => void refetchPurchases()}
          onEdit={(_purchase) => {
            // TODO: Implement edit functionality
            infoToast('Info', 'Fitur edit sedang dalam pengembangan')
          }}
          onDelete={(purchase) => {
            setPurchaseToDelete(purchase)
            setIsBulkDelete(false)
            setIsDeleteModalOpen(true)
          }}
          onBulkDelete={(purchasesToDelete) => {
            setPurchasesToDelete(purchasesToDelete)
            setIsBulkDelete(true)
            setIsDeleteModalOpen(true)
          }}
        />

        {/* Delete Confirmation Modal */}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setPurchaseToDelete(null)
            setPurchasesToDelete([])
            setIsBulkDelete(false)
          }}
          onConfirm={async () => {
            try {
              if (isBulkDelete) {
                // Bulk delete
                for (const purchase of purchasesToDelete) {
                  await deletePurchase.mutateAsync(purchase.id)
                }
                successToast("Berhasil", `${purchasesToDelete.length} pembelian berhasil dihapus`)
              } else if (purchaseToDelete) {
                // Single delete
                await deletePurchase.mutateAsync(purchaseToDelete.id)
              }
              setIsDeleteModalOpen(false)
              setPurchaseToDelete(null)
              setPurchasesToDelete([])
              setIsBulkDelete(false)
            } catch (error) {
              // Error handled by mutation
            }
          }}
          entityName={isBulkDelete ? 'Pembelian' : 'Pembelian'}
          itemName={isBulkDelete ? `${purchasesToDelete.length} item` : purchaseToDelete?.ingredient?.name || 'item ini'}
          isLoading={deletePurchase.isPending}
        />
      </div>
    </AppLayout>
  )
}

export { IngredientPurchasesLayout }
