'use client'

import { useEffect } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { BreadcrumbPatterns, PageBreadcrumb } from '@/components/ui/index'
import { useAuth } from '@/hooks/index'
import { useToast } from '@/hooks/use-toast'
import { useCreateIngredientPurchase, useIngredientPurchases } from '@/hooks/useIngredientPurchases'
import { useIngredients } from '@/hooks/useIngredients'

import type { Insert } from '@/types/database'

import { PurchaseForm } from '@/app/ingredients/purchases/components/PurchaseForm'
import { PurchasesTable } from '@/app/ingredients/purchases/components/PurchasesTable'
import { PurchaseStats } from '@/app/ingredients/purchases/components/PurchaseStats'



const IngredientPurchasesLayout = (): JSX.Element => {
  const { data: purchases = [], isLoading: _purchasesLoading } = useIngredientPurchases()
  const { data: ingredients = [], isLoading: _ingredientsLoading } = useIngredients()
  const createPurchase = useCreateIngredientPurchase()
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Handle auth errors
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({
        title: 'Sesi berakhir',
        description: 'Sesi Anda telah berakhir. Silakan login kembali.',
        variant: 'destructive',
      })
    }
  }, [isAuthLoading, isAuthenticated, toast])

  const handlePurchaseSubmit = async (formData: {
    ingredient_id: string;
    quantity: number;
    unit_price: number;
    supplier: string | null | undefined;
    purchase_date: string | undefined;
    notes: string | null | undefined;
  }) => {
    const totalPrice = formData.quantity * formData.unit_price;

    // Note: user_id will be handled by the API route authentication
    await createPurchase.mutateAsync({
      ingredient_id: formData.ingredient_id,
      quantity: formData.quantity,
      unit_price: formData.unit_price,
      supplier: formData.supplier ?? null,
      purchase_date: formData.purchase_date ?? '',
      notes: formData.notes ?? null,
      total_price: totalPrice,
      user_id: 'temp' // Will be overridden by API
    } as Insert<'ingredient_purchases'>)
  }

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 p-6">
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
      <div className="space-y-6 p-6">
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
        <PurchaseStats purchases={purchases} />

        {/* Purchases Table - Lazy Loaded */}
        <PurchasesTable purchases={purchases} />
      </div>
    </AppLayout>
  )
}

export { IngredientPurchasesLayout }
